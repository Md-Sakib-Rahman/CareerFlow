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

const makeUser = (plan, email = `${plan}@example.com`) =>
  User.create({ name: "u", email, passwordHash: "x", imageUrl: "http://img.invalid/a.png", plan });
const tokenFor = (u) => jwt.sign({ id: u._id, email: u.email, plan: u.plan }, process.env.ACCESS_TOKEN_SECRET);
const col = (b, status) => b.columns.find((c) => c.internalStatus === status);
const auth = (t) => ({ Authorization: `Bearer ${t}` });

const setup = async (plan = "executive") => {
  const user = await makeUser(plan);
  const token = tokenFor(user);
  const board = await Board.create({ userId: user._id, name: "b" });
  return { user, token, board };
};
const create = (token, board, extra = {}) =>
  request(app).post("/api/jobs").set(auth(token))
    .send({ boardId: board._id, columnId: col(board, "wishlist")._id, company: "Acme", title: "Dev", ...extra });
const patch = (token, id, body) => request(app).patch(`/api/jobs/${id}`).set(auth(token)).send(body);

describe("L4: POST /api/jobs stores location", () => {
  test("location persisted and returned", async () => {
    const { token, board } = await setup();
    const res = await create(token, board, { location: "Berlin" });
    expect(res.status).toBe(201);
    expect(res.body.data.location).toBe("Berlin");
    expect((await Job.findById(res.body.data._id)).location).toBe("Berlin");
  });
});

describe("L17: job limits via planLimits", () => {
  test("starter can create 20 jobs but not 21", async () => {
    const { token, board } = await setup("starter");
    for (let i = 0; i < 20; i++) expect((await create(token, board)).status).toBe(201);
    expect((await create(token, board)).status).toBe(403);
    expect(await Job.countDocuments()).toBe(20);
  });

  test("executive is unlimited", async () => {
    const { token, board } = await setup("executive");
    for (let i = 0; i < 21; i++) expect((await create(token, board)).status).toBe(201);
  });

  test("unknown plan gets starter limits", async () => {
    const { user, token, board } = await setup("starter");
    await User.collection.updateOne({ _id: user._id }, { $set: { plan: "admin" } });
    for (let i = 0; i < 20; i++) expect((await create(token, board)).status).toBe(201);
    expect((await create(token, board)).status).toBe(403);
  });
});

describe("L2: status/column consistency on PATCH", () => {
  test("columnId only moves the job and sets the matching status", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    const res = await patch(token, job._id, { columnId: col(board, "applied")._id });
    expect(res.status).toBe(200);
    const saved = await Job.findById(job._id);
    expect(saved.status).toBe("applied");
    expect(saved.columnId.toString()).toBe(col(board, "applied")._id.toString());
  });

  test("status only is rejected and the job is unchanged", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    const res = await patch(token, job._id, { status: "offer" });
    expect(res.status).toBe(400);
    const saved = await Job.findById(job._id);
    expect(saved.status).toBe("wishlist");
    expect(saved.columnId.toString()).toBe(col(board, "wishlist")._id.toString());
  });

  test("column from another board -> 400, job unchanged", async () => {
    const { user, token, board } = await setup();
    const other = await Board.create({ userId: user._id, name: "other" });
    const job = (await create(token, board)).body.data;
    const res = await patch(token, job._id, { columnId: col(other, "applied")._id });
    expect(res.status).toBe(400);
    expect((await Job.findById(job._id)).status).toBe("wishlist");
  });

  test("unknown or malformed columnId -> 400", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    expect((await patch(token, job._id, { columnId: "507f1f77bcf86cd799439011" })).status).toBe(400);
    expect((await patch(token, job._id, { columnId: "not-an-id" })).status).toBe(400);
  });

  test("columnId + mismatching status -> 400; matching -> 200", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    const cid = col(board, "applied")._id;
    expect((await patch(token, job._id, { columnId: cid, status: "offer" })).status).toBe(400);
    expect((await patch(token, job._id, { columnId: cid, status: "applied" })).status).toBe(200);
  });

  test("edit without column/status still works", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    expect((await patch(token, job._id, { company: "New" })).status).toBe(200);
  });
});

describe("L3: PATCH can clear url, location, notes", () => {
  test.each(["url", "location", "notes"])("clearing %s", async (field) => {
    const { token, board } = await setup();
    const job = (await create(token, board, { url: "http://x.invalid", location: "Paris", notes: "hi" })).body.data;
    expect(job[field]).not.toBe("");
    const res = await patch(token, job._id, { [field]: "" });
    expect(res.status).toBe(200);
    expect((await Job.findById(job._id))[field]).toBe("");
  });

  test("empty company or title is still ignored", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    await patch(token, job._id, { company: "", title: "" });
    const saved = await Job.findById(job._id);
    expect([saved.company, saved.title]).toEqual(["Acme", "Dev"]);
  });
});

const makeResume = (user, jobId) =>
  Resume.create({ userId: user._id, name: "cv.pdf", fileUrl: "http://f.invalid/cv", cloudinaryId: "r/cv", jobId });
const DATE = "2030-06-10T00:00:00.000Z";

describe("L5: wishlist date is stored as applyDeadlineAt", () => {
  test("actualInterviewDate on a wishlist job -> applyDeadlineAt, apply reminder", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    const res = await patch(token, job._id, { dates: { actualInterviewDate: DATE } });
    expect(res.status).toBe(200);
    const saved = await Job.findById(job._id);
    expect(saved.dates.applyDeadlineAt.toISOString()).toBe(DATE);
    expect(saved.dates.actualInterviewDate).toBeUndefined();
    const rem = await Reminder.findOne({ jobId: job._id, type: "apply" });
    expect(rem.targetDate.toISOString()).toBe(DATE);
  });
});

describe("L5: both dates on a wishlist job", () => {
  test("applyDeadlineAt wins, actualInterviewDate ignored, reminder targets applyDeadlineAt", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    const A = "2030-06-10T00:00:00.000Z";
    const B = "2030-07-20T00:00:00.000Z";
    const res = await patch(token, job._id, { dates: { applyDeadlineAt: A, actualInterviewDate: B } });
    expect(res.status).toBe(200);
    const saved = await Job.findById(job._id);
    expect(saved.dates.applyDeadlineAt.toISOString()).toBe(A);
    expect(saved.dates.actualInterviewDate).toBeUndefined();
    const rem = await Reminder.findOne({ jobId: job._id, type: "apply" });
    expect(rem.targetDate.toISOString()).toBe(A);
  });
});

describe("L6: dates whitelist and validation", () => {
  test("other keys are ignored", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    const res = await patch(token, job._id, {
      dates: { appliedAt: DATE, offerAt: DATE, rejectedAt: DATE, applyDeadlineAt: DATE },
    });
    expect(res.status).toBe(200);
    const saved = await Job.findById(job._id);
    expect(saved.dates.appliedAt).toBeUndefined();
    expect(saved.dates.offerAt).toBeUndefined();
    expect(saved.dates.rejectedAt).toBeUndefined();
    expect(saved.dates.applyDeadlineAt.toISOString()).toBe(DATE);
  });

  test.each(["applyDeadlineAt", "actualInterviewDate"])("invalid %s -> 400, nothing changed", async (key) => {
    const { token, board } = await setup();
    const job = (await create(token, board, { applyDeadlineAt: DATE })).body.data;
    const res = await patch(token, job._id, { dates: { [key]: "garbage" } });
    expect(res.status).toBe(400);
    expect(await Reminder.countDocuments({ jobId: job._id })).toBe(1);
  });
});

describe("L7: reminderLeadDays", () => {
  const body = (lead) => ({ dates: { applyDeadlineAt: DATE }, reminderLeadDays: lead });

  test("0 is kept on POST and PATCH", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board, { applyDeadlineAt: DATE, reminderLeadDays: 0 })).body.data;
    let rem = await Reminder.findOne({ jobId: job._id });
    expect(rem.leadDays).toBe(0);
    expect(rem.reminderDate.toISOString()).toBe(DATE);
    await patch(token, job._id, body(0));
    rem = await Reminder.findOne({ jobId: job._id });
    expect(rem.leadDays).toBe(0);
  });

  test("omitted -> default 2", async () => {
    const { token, board } = await setup();
    const job = (await create(token, board, { applyDeadlineAt: DATE })).body.data;
    expect((await Reminder.findOne({ jobId: job._id })).leadDays).toBe(2);
    await Reminder.deleteMany({});
    await patch(token, job._id, { dates: { applyDeadlineAt: DATE } });
    expect((await Reminder.findOne({ jobId: job._id })).leadDays).toBe(2);
  });

  test.each([31, "abc", -1])("%p -> 400 on POST and PATCH", async (bad) => {
    const { token, board } = await setup();
    const res = await create(token, board, { applyDeadlineAt: DATE, reminderLeadDays: bad });
    expect(res.status).toBe(400);
    expect(await Job.countDocuments()).toBe(0);
    const job = (await create(token, board)).body.data;
    expect((await patch(token, job._id, body(bad))).status).toBe(400);
    expect(await Reminder.countDocuments()).toBe(0);
  });
});

describe("L8: deleteJob unlinks resumes", () => {
  test("Resume.jobId nulled, resume kept", async () => {
    const { user, token, board } = await setup();
    const job = (await create(token, board)).body.data;
    const r = await makeResume(user, job._id);
    const res = await request(app).delete(`/api/jobs/${job._id}`).set(auth(token));
    expect(res.status).toBe(200);
    expect((await Resume.findById(r._id)).jobId).toBeNull();
  });
});

describe("L18: leaving rejected clears rejectedAt", () => {
  test.each(["applied", "offer"])("rejected -> %s", async (target) => {
    const { token, board } = await setup();
    const job = (await create(token, board)).body.data;
    await patch(token, job._id, { columnId: col(board, "rejected")._id, status: "rejected" });
    expect((await Job.findById(job._id)).dates.rejectedAt).toBeDefined();
    await patch(token, job._id, { columnId: col(board, target)._id, status: target });
    expect((await Job.findById(job._id)).dates.rejectedAt).toBeUndefined();
  });
});
