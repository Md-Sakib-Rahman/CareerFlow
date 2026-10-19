// Safety net for every test file: no real database or external service can be reached.
const FAKE_MONGO_URL = "mongodb://fake.invalid/careerflow-test";

// Overwrite anything inherited from the shell, then assert it.
process.env.NODE_ENV = "test";
process.env.MONGO_URL = FAKE_MONGO_URL;
if (process.env.MONGO_URL !== FAKE_MONGO_URL) {
  throw new Error("Test setup: MONGO_URL must be the fake value");
}
Object.assign(process.env, {
  ACCESS_TOKEN_SECRET: "test-access-secret",
  REFRESH_TOKEN_SECRET: "test-refresh-secret",
  CRON_SECRET: "test-cron-secret",
  CLIENT_URL: "http://localhost:5173",
  GOOGLE_CLIENT_ID: "test-google-client-id",
  EMAIL_USER: "test@example.invalid",
  EMAIL_PASS: "test-pass",
  STRIPE_SECRET_KEY: "sk_test_fake",
  STRIPE_WEBHOOK_SECRET: "whsec_fake",
  CLOUDINARY_CLOUD_NAME: "fake",
  CLOUDINARY_API_KEY: "fake",
  CLOUDINARY_API_SECRET: "fake",
  GEMINI_API_KEY: "fake",
});

// ---- External services: mocked ----
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: "mock-message-id" }),
  })),
}));

jest.mock("stripe", () =>
  jest.fn(() => ({
    checkout: { sessions: { create: jest.fn().mockResolvedValue({ url: "https://stripe.invalid/session" }) } },
    webhooks: { constructEvent: jest.fn() },
  }))
);

jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn().mockResolvedValue({ response: { text: () => "mock insight" } }),
    })),
  })),
}));

// Outbound HTTP (Google userinfo etc.)
jest.mock("axios", () => {
  const instance = { get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() };
  return { ...instance, create: jest.fn(() => instance), default: instance };
});

// The app's per-request DB connect middleware must not touch a database.
jest.mock("../src/config/db", () => jest.fn().mockResolvedValue(undefined));

// ---- MongoDB guard: only mongodb://127.0.0.1 (the in-memory server) is allowed ----
const mongoose = require("mongoose");
const isLocalMemoryUri = (uri) => typeof uri === "string" && uri.startsWith("mongodb://127.0.0.1");
const blocked = (uri) =>
  new Error(`Tests may only connect to mongodb://127.0.0.1 (got "${String(uri).slice(0, 30)}...")`);

const realConnect = mongoose.connect.bind(mongoose);
jest.spyOn(mongoose, "connect").mockImplementation((uri, ...rest) => {
  if (!isLocalMemoryUri(uri)) throw blocked(uri);
  return realConnect(uri, ...rest);
});

// Also guard createConnection()/openUri so a second route to a real DB is closed.
const realOpenUri = mongoose.Connection.prototype.openUri;
mongoose.Connection.prototype.openUri = function (uri, ...rest) {
  if (!isLocalMemoryUri(uri)) throw blocked(uri);
  return realOpenUri.call(this, uri, ...rest);
};
