const request = require("supertest");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");
const Otp = require("../src/models/Otp");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

test("S5: register ignores body.plan, stored plan is starter", async () => {
  await Otp.create({ email: "new@example.com", otp: "123456" });
  const res = await request(app).post("/auth/register").send({
    name: "New",
    email: "new@example.com",
    password: "Passw0rd!",
    plan: "executive",
    imageUrl: "http://img.invalid/a.png",
    otp: "123456",
  });
  expect(res.status).toBe(201);
  const user = await User.findOne({ email: "new@example.com" });
  expect(user.plan).toBe("starter");
});

const reg = (over = {}) =>
  request(app).post("/auth/register").send({
    name: "New",
    email: "new@example.com",
    password: "Passw0rd!",
    imageUrl: "http://img.invalid/a.png",
    otp: "123456",
    ...over,
  });
const existing = () =>
  User.create({ name: "E", email: "new@example.com", passwordHash: "x", imageUrl: "http://img.invalid/a.png" });

test("S22: existing email + wrong OTP -> generic 'Invalid or expired OTP'", async () => {
  await existing();
  await Otp.create({ email: "new@example.com", otp: "123456" });
  const res = await reg({ otp: "000000" });
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Invalid or expired OTP");
});

test("S22: existing email + correct OTP -> 400 'Email already exists'", async () => {
  await existing();
  await Otp.create({ email: "new@example.com", otp: "123456" });
  const res = await reg();
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Email already exists");
});

test("S22: duplicate-key error 11000 on save -> 400 'Email already exists'", async () => {
  await Otp.create({ email: "new@example.com", otp: "123456" });
  jest.spyOn(User.prototype, "save").mockRejectedValue(Object.assign(new Error("E11000"), { code: 11000 }));
  const res = await reg();
  jest.restoreAllMocks();
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Email already exists");
});

test("S22: no imageUrl -> 201 with a default avatar", async () => {
  await Otp.create({ email: "new@example.com", otp: "123456" });
  const res = await reg({ imageUrl: undefined });
  expect(res.status).toBe(201);
  expect(res.body.data.imageUrl).toMatch(/^https?:\/\//);
});
