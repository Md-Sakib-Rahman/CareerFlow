const request = require("supertest");
const jwt = require("jsonwebtoken");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");
const Board = require("../src/models/Board");
const Job = require("../src/models/Job");
const Reminder = require("../src/models/Reminder");
const Resume = require("../src/models/Resume");

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

describe("L8: deleteBoard cleans reminders and resume links", () => {
  test("reminders deleted, resumes unlinked but kept, other boards untouched", async () => {
    const user = await makeUser("executive");
    const token = tokenFor(user);
    const auth = { Authorization: `Bearer ${token}` };
    const b1 = (await post(token, "one")).body.data;
    const b2 = (await post(token, "two")).body.data;
    const addJob = async (b) => {
      const j = (await request(app).post("/api/jobs").set(auth).send({
        boardId: b._id, columnId: b.columns[0]._id, company: "A", title: "D", applyDeadlineAt: "2030-06-10T00:00:00.000Z",
      })).body.data;
      const r = await Resume.create({ userId: user._id, name: "cv", fileUrl: "http://f.invalid/cv", cloudinaryId: "r/cv", jobId: j._id });
      return { j, r };
    };
    const a = await addJob(b1);
    const o = await addJob(b2);
    expect(await Reminder.countDocuments()).toBe(2);

    const res = await request(app).delete(`/api/boards/${b1._id}`).set(auth);
    expect(res.status).toBe(200);
    expect(await Reminder.countDocuments({ jobId: a.j._id })).toBe(0);
    expect(await Reminder.countDocuments({ jobId: o.j._id })).toBe(1);
    expect((await Resume.findById(a.r._id)).jobId).toBeNull();
    expect(String((await Resume.findById(o.r._id)).jobId)).toBe(String(o.j._id));
    expect(await Job.countDocuments({ boardId: b1._id })).toBe(0);
  });
});
