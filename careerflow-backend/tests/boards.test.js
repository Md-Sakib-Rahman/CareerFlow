const request = require("supertest");
const jwt = require("jsonwebtoken");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");
const Board = require("../src/models/Board");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const makeUser = (plan) =>
  User.create({ name: "u", email: `${plan}@example.com`, passwordHash: "x", imageUrl: "http://img.invalid/a.png", plan });
const tokenFor = (u) => jwt.sign({ id: u._id, email: u.email, plan: u.plan }, process.env.ACCESS_TOKEN_SECRET);
const post = (token, name) => request(app).post("/api/boards").set("Authorization", `Bearer ${token}`).send({ name });

describe("L1: new boards have all five funnel columns", () => {
  test("POST /api/boards -> 5 columns incl. rejected; PATCH columns then succeeds", async () => {
    const user = await makeUser("pro");
    const token = tokenFor(user);
    const created = await post(token, "x");
    expect(created.status).toBe(201);
    const cols = created.body.data.columns;
    expect(cols.map((c) => c.internalStatus)).toEqual(["wishlist", "applied", "interviewing", "offer", "rejected"]);

    const patch = await request(app)
      .patch(`/api/boards/${created.body.data._id}/columns`)
      .set("Authorization", `Bearer ${token}`)
      .send({ columns: cols });
    expect(patch.status).toBe(200);
  });
});

describe("L17: board limits via planLimits", () => {
  test("pro can create 10 boards but not 11", async () => {
    const token = tokenFor(await makeUser("pro"));
    for (let i = 0; i < 10; i++) expect((await post(token, `b${i}`)).status).toBe(201);
    expect((await post(token, "b11")).status).toBe(403);
    expect(await Board.countDocuments()).toBe(10);
  });

  test("starter: 1 board, second blocked", async () => {
    const token = tokenFor(await makeUser("starter"));
    expect((await post(token, "a")).status).toBe(201);
    expect((await post(token, "b")).status).toBe(403);
  });

  test("executive is unlimited", async () => {
    const token = tokenFor(await makeUser("executive"));
    for (let i = 0; i < 12; i++) expect((await post(token, `b${i}`)).status).toBe(201);
  });

  test("unknown plan gets starter limits", async () => {
    const user = await makeUser("starter");
    await User.collection.updateOne({ _id: user._id }, { $set: { plan: "admin" } });
    const token = tokenFor(user);
    expect((await post(token, "a")).status).toBe(201);
    expect((await post(token, "b")).status).toBe(403);
  });
});
