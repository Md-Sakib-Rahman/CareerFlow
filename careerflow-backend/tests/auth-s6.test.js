const request = require("supertest");
const jwt = require("jsonwebtoken");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");
const Otp = require("../src/models/Otp");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const regBody = (over = {}) => ({
  name: "New",
  email: "new@example.com",
  password: "Passw0rd!",
  imageUrl: "http://img.invalid/a.png",
  otp: "123456",
  ...over,
});

test("S6: register with otp {$gt:''} -> 400 and no account created", async () => {
  await Otp.create({ email: "new@example.com", otp: "123456" });
  const res = await request(app).post("/auth/register").send(regBody({ otp: { $gt: "" } }));
  expect(res.status).toBe(400);
  expect(await User.countDocuments()).toBe(0);
});

test("S6: register with non-string email/password -> 400, no account", async () => {
  await Otp.create({ email: "new@example.com", otp: "123456" });
  for (const over of [{ email: { $ne: null } }, { password: 12345678 }]) {
    const res = await request(app).post("/auth/register").send(regBody(over));
    expect(res.status).toBe(400);
  }
  expect(await User.countDocuments()).toBe(0);
});

test("S6: send-otp / login / forgot-password with non-string email -> 400", async () => {
  await User.create({ name: "U", email: "u@example.com", passwordHash: "x", imageUrl: "http://img.invalid/a.png" });
  for (const path of ["/auth/send-otp", "/auth/login", "/auth/forgot-password"]) {
    const res = await request(app).post(path).send({ email: { $ne: null }, password: "x" });
    expect([path, res.status]).toEqual([path, 400]);
  }
  const res = await request(app).post("/auth/login").send({ email: "u@example.com", password: { $ne: 1 } });
  expect(res.status).toBe(400);
});

test("S6: reset-password non-string password, set-password non-string newPassword -> 400", async () => {
  const u = await User.create({
    name: "G", email: "g@example.com", passwordHash: "x", authProvider: "google", imageUrl: "http://img.invalid/a.png",
  });
  const token = jwt.sign({ id: u._id, email: u.email }, process.env.ACCESS_TOKEN_SECRET);
  const a = await request(app).post("/auth/set-password").set("Authorization", `Bearer ${token}`).send({ newPassword: { x: 1 } });
  expect(a.status).toBe(400);
  const b = await request(app).patch("/auth/reset-password/sometoken").send({ password: ["a"] });
  expect(b.status).toBe(400);
});

test("S6: 5 wrong OTPs, then the correct OTP is rejected", async () => {
  await Otp.create({ email: "new@example.com", otp: "123456" });
  for (let i = 0; i < 5; i++) {
    const r = await request(app).post("/auth/register").send(regBody({ otp: "000000" }));
    expect(r.status).toBe(400);
  }
  const res = await request(app).post("/auth/register").send(regBody());
  expect(res.status).toBe(400);
  expect(await User.countDocuments()).toBe(0);
});

test("S6: OTP is 6 digits", async () => {
  for (let i = 0; i < 20; i++) {
    const res = await request(app)
      .post("/auth/send-otp")
      .set("x-forwarded-for", `10.0.0.${i}`) // distinct IPs: this test is not about the S7 limit
      .send({ email: `a${i}@example.com` });
    expect(res.status).toBe(200);
    const doc = await Otp.findOne({ email: `a${i}@example.com` });
    expect(doc.otp).toMatch(/^\d{6}$/);
  }
});

test("S6: 10 parallel wrong guesses -> at most 5 evaluated, then correct OTP rejected", async () => {
  await Otp.create({ email: "new@example.com", otp: "123456" });
  const results = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      request(app).post("/auth/register").set("x-forwarded-for", `10.0.1.${i}`).send(regBody({ otp: "000000" })),
    ),
  );
  expect(results.every((r) => r.status === 400)).toBe(true);
  expect((await Otp.findOne({ email: "new@example.com" })).attempts).toBe(5);
  const res = await request(app).post("/auth/register").set("x-forwarded-for", "10.0.1.99").send(regBody());
  expect(res.status).toBe(400);
  expect(await User.countDocuments()).toBe(0);
});

test("S6: the same OTP cannot be used twice", async () => {
  await Otp.create({ email: "new@example.com", otp: "123456" });
  const first = await request(app).post("/auth/register").send(regBody());
  expect(first.status).toBe(201);
  expect(await Otp.countDocuments({ email: "new@example.com" })).toBe(0);
  await User.deleteMany({});
  const second = await request(app).post("/auth/register").send(regBody());
  expect(second.status).toBe(400);
  expect(await User.countDocuments()).toBe(0);
});
