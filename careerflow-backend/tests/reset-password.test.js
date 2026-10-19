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
