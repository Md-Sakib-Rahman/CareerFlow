const request = require("supertest");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const RAW = "a".repeat(40);
const makeUser = (expires) =>
  User.create({
    name: "U",
    email: "u@example.com",
    passwordHash: bcrypt.hashSync("OldPassw0rd!", 10),
    imageUrl: "http://img.invalid/a.png",
    passwordResetToken: crypto.createHash("sha256").update(RAW).digest("hex"),
    passwordResetExpires: expires,
  });

test("resetPassword: valid unexpired token succeeds and new password logs in", async () => {
  await makeUser(Date.now() + 60 * 1000);
  const res = await request(app).patch(`/auth/reset-password/${RAW}`).send({ password: "NewPassw0rd!" });
  expect(res.status).toBe(200);
  const login = await request(app).post("/auth/login").send({ email: "u@example.com", password: "NewPassw0rd!" });
  expect(login.status).toBe(200);
  const old = await request(app).post("/auth/login").send({ email: "u@example.com", password: "OldPassw0rd!" });
  expect(old.status).toBe(401);
});

test("resetPassword: expired token -> 400", async () => {
  await makeUser(Date.now() - 60 * 1000);
  const res = await request(app).patch(`/auth/reset-password/${RAW}`).send({ password: "NewPassw0rd!" });
  expect(res.status).toBe(400);
});

test("resetPassword: wrong token -> 400", async () => {
  await makeUser(Date.now() + 60 * 1000);
  const res = await request(app).patch(`/auth/reset-password/${"b".repeat(40)}`).send({ password: "NewPassw0rd!" });
  expect(res.status).toBe(400);
});

test("S19: reset clears lockUntil and failedLoginAttempts", async () => {
  const user = await makeUser(Date.now() + 60 * 1000);
  await User.updateOne({ _id: user._id }, { lockUntil: new Date(Date.now() + 3600 * 1000), failedLoginAttempts: 5 });
  const res = await request(app).patch(`/auth/reset-password/${RAW}`).send({ password: "NewPassw0rd!" });
  expect(res.status).toBe(200);
  const after = await User.findById(user._id);
  expect(after.lockUntil).toBeUndefined();
  expect(after.failedLoginAttempts).toBe(0);
});

test("S19: reset turns authProvider google into both", async () => {
  const user = await makeUser(Date.now() + 60 * 1000);
  await User.updateOne({ _id: user._id }, { authProvider: "google" });
  await request(app).patch(`/auth/reset-password/${RAW}`).send({ password: "NewPassw0rd!" });
  expect((await User.findById(user._id)).authProvider).toBe("both");
});

test("S19: reset leaves a local authProvider as local", async () => {
  const user = await makeUser(Date.now() + 60 * 1000);
  await request(app).patch(`/auth/reset-password/${RAW}`).send({ password: "NewPassw0rd!" });
  expect((await User.findById(user._id)).authProvider).toBe("local");
});
