const request = require("supertest");
const nodemailer = require("nodemailer");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");
const RateLimit = require("../src/models/RateLimit");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  jest.clearAllMocks();
});
afterEach(() => jest.restoreAllMocks());

const TOO_MANY = { success: false, message: "Too many requests. Please try again later." };
const sendOtp = (email, ip = "1.1.1.1") =>
  request(app).post("/auth/send-otp").set("x-forwarded-for", ip).send({ email });
const login = (ip) =>
  request(app).post("/auth/login").set("x-forwarded-for", ip).send({ email: "nobody@example.com", password: "x" });

test("S7: 4th send-otp for one email within the hour -> 429; another email still works", async () => {
  for (let i = 0; i < 3; i++) expect((await sendOtp("a@example.com", `9.9.9.${i}`)).status).toBe(200);
  const blocked = await sendOtp("a@example.com", "9.9.9.9");
  expect(blocked.status).toBe(429);
  expect(blocked.body).toEqual(TOO_MANY);
  expect((await sendOtp("b@example.com", "9.9.9.9")).status).toBe(200);
});

test("S7: 11th login from one IP -> 429; a different IP is unaffected", async () => {
  for (let i = 0; i < 10; i++) expect((await login("2.2.2.2")).status).toBe(401);
  const blocked = await login("2.2.2.2");
  expect(blocked.status).toBe(429);
  expect(blocked.body).toEqual(TOO_MANY);
  expect((await login("3.3.3.3")).status).toBe(401);
});

test("S7: the 429 response has a Retry-After header (seconds)", async () => {
  for (let i = 0; i < 10; i++) await login("4.4.4.4");
  const res = await login("4.4.4.4");
  expect(res.status).toBe(429);
  const retry = Number(res.headers["retry-after"]);
  expect(Number.isInteger(retry)).toBe(true);
  expect(retry).toBeGreaterThan(0);
  expect(retry).toBeLessThanOrEqual(900);
});

test("S7: the limiter fails open when the database call throws", async () => {
  jest.spyOn(RateLimit, "findOneAndUpdate").mockImplementation(() => {
    throw new Error("db down");
  });
  jest.spyOn(console, "error").mockImplementation(() => {});
  const res = await login("5.5.5.5");
  expect(res.status).toBe(401); // reached the controller
  expect(console.error).toHaveBeenCalled();
});

test("S7: a counter whose expiresAt is in the past restarts at 1 and is allowed again", async () => {
  await RateLimit.create({ key: "login:ip:6.6.6.6", count: 50, expiresAt: new Date(Date.now() - 1000) });
  const res = await login("6.6.6.6");
  expect(res.status).toBe(401);
  const doc = await RateLimit.findOne({ key: "login:ip:6.6.6.6" });
  expect(doc.count).toBe(1);
  expect(doc.expiresAt.getTime()).toBeGreaterThan(Date.now());
});

test("S7: 5 parallel requests for the same key count to exactly 5; blocked requests do not extend expiry", async () => {
  await Promise.all([1, 2, 3, 4, 5].map(() => login("7.7.7.7")));
  const doc = await RateLimit.findOne({ key: "login:ip:7.7.7.7" });
  expect(doc.count).toBe(5);

  const before = doc.expiresAt.getTime();
  for (let i = 0; i < 6; i++) await login("7.7.7.7"); // 11th is blocked
  const after = await RateLimit.findOne({ key: "login:ip:7.7.7.7" });
  expect(after.expiresAt.getTime()).toBe(before);
});

test("S14: forgot-password for an unknown email -> 200, same body as a known email, no mail sent", async () => {
  await User.create({ name: "U", email: "known@example.com", passwordHash: "x", imageUrl: "http://img.invalid/a.png" });

  const unknown = await request(app).post("/auth/forgot-password").send({ email: "ghost@example.com" });
  expect(unknown.status).toBe(200);
  expect(nodemailer.createTransport).not.toHaveBeenCalled();

  const known = await request(app).post("/auth/forgot-password").send({ email: "known@example.com" });
  expect(known.status).toBe(200);
  expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
  expect(known.body).toEqual(unknown.body);
  expect(known.body).not.toHaveProperty("resetUrl");
  expect(unknown.body).toEqual({
    success: true,
    message: "If an account with that email exists, a reset link has been sent.",
  });
});

test("S14: forgot-password never returns resetUrl, even in development", async () => {
  await User.create({ name: "U", email: "known@example.com", passwordHash: "x", imageUrl: "http://img.invalid/a.png" });
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";
  try {
    const res = await request(app).post("/auth/forgot-password").send({ email: "known@example.com" });
    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("resetUrl");
    expect(res.body.message).toBe("If an account with that email exists, a reset link has been sent.");
  } finally {
    process.env.NODE_ENV = prev;
  }
});
