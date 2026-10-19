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
