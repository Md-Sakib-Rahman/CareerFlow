const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Writable } = require("stream");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");
const Job = require("../src/models/Job");
const Resume = require("../src/models/Resume");
const cloudinary = require("cloudinary").v2;

beforeAll(startDb);
afterAll(stopDb);

let userA, userB, tokenA, tokenB;

const makeUser = (email) =>
  User.create({ name: email, email, passwordHash: "x", imageUrl: "http://img.invalid/a.png" });
const tokenFor = (u) =>
  jwt.sign({ id: u._id, email: u.email, plan: u.plan }, process.env.ACCESS_TOKEN_SECRET);
const makeJob = (userId) =>
  Job.create({
    userId,
    boardId: new mongoose.Types.ObjectId(),
    columnId: new mongoose.Types.ObjectId(),
    company: "Acme",
    title: "Engineer",
  });
const makeResume = (userId, extra = {}) =>
  Resume.create({ userId, name: "cv.pdf", fileUrl: "http://f.invalid/cv", cloudinaryId: "resumes/cv", ...extra });

beforeEach(async () => {
  await clearDb();
  jest.clearAllMocks();
  userA = await makeUser("a@example.com");
  userB = await makeUser("b@example.com");
  tokenA = tokenFor(userA);
  tokenB = tokenFor(userB);
});

describe("S2: resume PATCH/DELETE auth and ownership", () => {
  test("PATCH without token -> 401", async () => {
    const r = await makeResume(userA._id);
    const res = await request(app).patch(`/api/resume/${r._id}`).send({ type: "Hacked" });
    expect(res.status).toBe(401);
    expect((await Resume.findById(r._id)).type).toBe("General");
  });

  test("DELETE without token -> 401", async () => {
    const r = await makeResume(userA._id);
    const res = await request(app).delete(`/api/resume/${r._id}`);
    expect(res.status).toBe(401);
    expect(await Resume.findById(r._id)).not.toBeNull();
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
  });

  test("PATCH another user's resume -> 404 and resume untouched", async () => {
    const r = await makeResume(userA._id);
    const res = await request(app)
      .patch(`/api/resume/${r._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ type: "Hacked" });
    expect(res.status).toBe(404);
    expect((await Resume.findById(r._id)).type).toBe("General");
  });

  test("DELETE another user's resume -> 404 and resume untouched", async () => {
    const r = await makeResume(userA._id);
    const res = await request(app).delete(`/api/resume/${r._id}`).set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
    expect(await Resume.findById(r._id)).not.toBeNull();
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
  });

  test("owner can PATCH", async () => {
    const r = await makeResume(userA._id);
    const res = await request(app)
      .patch(`/api/resume/${r._id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ type: "Tech" });
    expect(res.status).toBe(200);
    expect((await Resume.findById(r._id)).type).toBe("Tech");
  });

  test("owner can DELETE", async () => {
    const r = await makeResume(userA._id);
    const res = await request(app).delete(`/api/resume/${r._id}`).set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(await Resume.findById(r._id)).toBeNull();
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("resumes/cv", { resource_type: "raw" });
  });
});

describe("S4: resume jobId ownership", () => {
  const mockUpload = () =>
    cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => {
      cb(null, { secure_url: "http://f.invalid/new", public_id: "resumes/new" });
      return new Writable({ write: (c, e, done) => done() });
    });
  const add = (token, jobId) =>
    request(app)
      .post("/api/resume/add")
      .set("Authorization", `Bearer ${token}`)
      .field("jobId", jobId)
      .attach("resume", Buffer.from("pdf"), "cv.pdf");

  test("POST /add with another user's jobId -> rejected, nothing saved", async () => {
    mockUpload();
    const job = await makeJob(userA._id);
    const res = await add(tokenB, String(job._id));
    expect(res.status).toBe(404);
    expect(await Resume.countDocuments({ userId: userB._id })).toBe(0);
  });

  test("POST /add with invalid jobId -> 400", async () => {
    mockUpload();
    const res = await add(tokenB, "not-an-id");
    expect(res.status).toBe(400);
  });

  test("POST /add with own jobId and with General -> 201", async () => {
    mockUpload();
    const job = await makeJob(userB._id);
    expect((await add(tokenB, String(job._id))).status).toBe(201);
    expect((await add(tokenB, "General")).status).toBe(201);
  });

  test("PATCH with another user's jobId -> rejected, jobId not stored", async () => {
    const job = await makeJob(userA._id);
    const r = await makeResume(userB._id);
    const res = await request(app)
      .patch(`/api/resume/${r._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ jobId: String(job._id) });
    expect(res.status).toBe(404);
    expect((await Resume.findById(r._id)).jobId).toBeNull();
  });

  test("PATCH with invalid jobId -> 400", async () => {
    const r = await makeResume(userB._id);
    const res = await request(app)
      .patch(`/api/resume/${r._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ jobId: "not-an-id" });
    expect(res.status).toBe(400);
  });

  test("PATCH with own jobId and with General -> 200", async () => {
    const job = await makeJob(userB._id);
    const r = await makeResume(userB._id);
    const res1 = await request(app)
      .patch(`/api/resume/${r._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ jobId: String(job._id) });
    expect(res1.status).toBe(200);
    const res2 = await request(app)
      .patch(`/api/resume/${r._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ jobId: "General" });
    expect(res2.status).toBe(200);
    expect((await Resume.findById(r._id)).jobId).toBeNull();
  });
});
