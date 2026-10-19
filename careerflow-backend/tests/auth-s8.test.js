const request = require("supertest");
const axios = require("axios");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  axios.get.mockReset();
});

// Mock Google: tokeninfo (audience / verification) and userinfo (profile).
const mockGoogle = ({ aud = "test-google-client-id", email_verified = "true", email = "g@example.com" } = {}) => {
  axios.get.mockImplementation(async (url) => {
    if (String(url).includes("tokeninfo")) return { data: { aud, email, email_verified } };
    return { data: { email, email_verified: email_verified === "true", name: "G User", picture: "http://img.invalid/g.png" } };
  });
};

test("S8: token for another audience -> 401, no account", async () => {
  mockGoogle({ aud: "some-other-client-id" });
  const res = await request(app).post("/auth/google").send({ idToken: "tok" });
  expect(res.status).toBe(401);
  expect(await User.countDocuments()).toBe(0);
});

test("S8: unverified email -> 401, no account", async () => {
  mockGoogle({ email_verified: "false" });
  const res = await request(app).post("/auth/google").send({ idToken: "tok" });
  expect(res.status).toBe(401);
  expect(await User.countDocuments()).toBe(0);
});

test("S8: valid token -> login works", async () => {
  mockGoogle();
  const res = await request(app).post("/auth/google").send({ idToken: "tok" });
  expect(res.status).toBe(200);
  expect(res.body.data.email).toBe("g@example.com");
  expect(await User.countDocuments()).toBe(1);
});

test("S8: non-string idToken -> 400", async () => {
  mockGoogle();
  const res = await request(app).post("/auth/google").send({ idToken: { $ne: null } });
  expect(res.status).toBe(400);
  expect(axios.get).not.toHaveBeenCalled();
});
