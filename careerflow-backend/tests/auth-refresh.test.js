const request = require("supertest");
const jwt = require("jsonwebtoken");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);
afterEach(() => jest.restoreAllMocks());

const makeUser = () =>
  User.create({ name: "U", email: "u@example.com", passwordHash: "x", imageUrl: "http://img.invalid/a.png" });
const cookieFor = (user) =>
  `refreshToken=${jwt.sign({ id: user._id, email: user.email, plan: user.plan }, process.env.REFRESH_TOKEN_SECRET)}`;

test("S17: valid cookie -> 200 with a new access token", async () => {
  const user = await makeUser();
  const res = await request(app).get("/auth/refresh-token").set("Cookie", cookieFor(user));
  expect(res.status).toBe(200);
  expect(typeof res.body.accessToken).toBe("string");
});

test("S17: invalid cookie -> 403", async () => {
  const res = await request(app).get("/auth/refresh-token").set("Cookie", "refreshToken=garbage");
  expect(res.status).toBe(403);
});

test("S17: user lookup throws -> 500 and the request completes", async () => {
  const user = await makeUser();
  jest.spyOn(User, "findById").mockRejectedValue(new Error("db down"));
  const res = await request(app)
    .get("/auth/refresh-token")
    .set("Cookie", cookieFor(user))
    .timeout({ response: 3000, deadline: 3000 });
  expect(res.status).toBe(500);
});
