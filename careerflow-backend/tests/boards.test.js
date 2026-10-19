const request = require("supertest");
const mongoose = require("mongoose");
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

describe("L15: PATCH /api/boards/:id/columns validation", () => {
  const setup = async () => {
    const user = await makeUser("pro");
    const token = tokenFor(user);
    const board = (await post(token, "b")).body.data;
    const patch = (columns) =>
      request(app).patch(`/api/boards/${board._id}/columns`).set("Authorization", `Bearer ${token}`).send({ columns });
    const plain = board.columns.map((c) => ({ ...c }));
    return { user, token, board, patch, plain };
  };

  test.each([
    ["missing", undefined],
    ["not an array", "nope"],
    ["empty", []],
  ])("columns %s -> 400", async (_n, value) => {
    const { patch } = await setup();
    expect((await patch(value)).status).toBe(400);
  });

  test("item without a string title -> 400", async () => {
    const { patch, plain } = await setup();
    expect((await patch([...plain, { title: 5, internalStatus: "applied" }])).status).toBe(400);
    expect((await patch([...plain, { internalStatus: "applied" }])).status).toBe(400);
  });

  test("item with missing or invalid internalStatus -> 400", async () => {
    const { patch, plain } = await setup();
    expect((await patch([...plain, { title: "X", internalStatus: "bogus" }])).status).toBe(400);
    expect((await patch([...plain, { title: "X" }])).status).toBe(400);
  });

  test("changing internalStatus of a column holding jobs -> 400; allowed when empty", async () => {
    const { user, board, patch, plain } = await setup();
    await Job.create({
      userId: user._id, boardId: board._id, columnId: board.columns[1]._id, company: "A", title: "T",
    });
    const changed = plain.map((c) => ({ ...c }));
    changed[1].internalStatus = "interviewing"; // column with a job
    expect((await patch(changed)).status).toBe(400);

    const emptyChange = plain.map((c) => ({ ...c }));
    emptyChange[2].internalStatus = "applied"; // empty column; a new interviewing column keeps types complete
    emptyChange.push({ title: "New", internalStatus: "interviewing" });
    expect((await patch(emptyChange)).status).toBe(200);
  });

  test("unknown _id -> 400", async () => {
    const { patch, plain } = await setup();
    plain.push({ _id: String(new mongoose.Types.ObjectId()), title: "X", internalStatus: "applied" });
    expect((await patch(plain)).status).toBe(400);
  });

  test("archived column is ordered last with clean positions", async () => {
    const { patch, plain } = await setup();
    const withArchived = [
      { title: "Arch", internalStatus: "archived", position: 0 },
      ...plain,
    ];
    const res = await patch(withArchived);
    expect(res.status).toBe(200);
    const cols = res.body.data.columns;
    expect(cols.map((c) => c.internalStatus)).toEqual([
      "wishlist", "applied", "interviewing", "offer", "rejected", "archived",
    ]);
    expect(cols.map((c) => c.position)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  test("client payload (existing columns + one new column without _id) -> 200", async () => {
    const { patch, plain } = await setup();
    const res = await patch([
      ...plain,
      { title: "Round 2", internalStatus: "interviewing", color: "#f59e0b", position: 5 },
    ]);
    expect(res.status).toBe(200);
    expect(res.body.data.columns).toHaveLength(6);
    expect(res.body.data.columns.map((c) => c.title)).toContain("Round 2");
  });
});
