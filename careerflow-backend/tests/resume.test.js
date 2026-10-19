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

const makeUser = (email, plan = "pro") =>
  User.create({ name: email, email, passwordHash: "x", imageUrl: "http://img.invalid/a.png", plan });
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

describe("L19: resume upload/save/delete ordering", () => {
  const okUpload = () =>
    cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => {
      cb(null, { secure_url: "http://f.invalid/new", public_id: "resumes/new" });
      return new Writable({ write: (c, e, done) => done() });
    });
  const failUpload = () =>
    cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => {
      cb(new Error("upload failed"));
      return new Writable({ write: (c, e, done) => done() });
    });
  const patchFile = (id) =>
    request(app)
      .patch(`/api/resume/${id}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .attach("resume", Buffer.from("pdf"), "new.pdf");

  afterEach(() => jest.restoreAllMocks());

  test("PATCH: failed new upload leaves old asset and record untouched", async () => {
    failUpload();
    const r = await makeResume(userA._id);
    const res = await patchFile(r._id);
    expect(res.status).toBe(500);
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    const after = await Resume.findById(r._id);
    expect(after.cloudinaryId).toBe("resumes/cv");
    expect(after.name).toBe("cv.pdf");
  });

  test("PATCH: failed save removes the new asset, keeps the old one", async () => {
    okUpload();
    const r = await makeResume(userA._id);
    jest.spyOn(Resume.prototype, "save").mockRejectedValueOnce(new Error("save failed"));
    const res = await patchFile(r._id);
    expect(res.status).toBe(500);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(1);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("resumes/new", { resource_type: "raw" });
    expect((await Resume.findById(r._id)).cloudinaryId).toBe("resumes/cv");
  });

  test("PATCH: success uploads, saves, then destroys the old asset", async () => {
    okUpload();
    const r = await makeResume(userA._id);
    const res = await patchFile(r._id);
    expect(res.status).toBe(200);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(1);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("resumes/cv", { resource_type: "raw" });
    expect((await Resume.findById(r._id)).cloudinaryId).toBe("resumes/new");
  });

  test("POST: failed save after upload removes the uploaded asset", async () => {
    okUpload();
    jest.spyOn(Resume.prototype, "save").mockRejectedValueOnce(new Error("save failed"));
    const res = await request(app)
      .post("/api/resume/add")
      .set("Authorization", `Bearer ${tokenA}`)
      .field("jobId", "General")
      .attach("resume", Buffer.from("pdf"), "cv.pdf");
    expect(res.status).toBe(500);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("resumes/new", { resource_type: "raw" });
    expect(await Resume.countDocuments()).toBe(0);
  });
});

describe("S3: resume plan limits, file type and size", () => {
  const okUpload = () =>
    cloudinary.uploader.upload_stream.mockImplementation((opts, cb) => {
      cb(null, { secure_url: "http://f.invalid/new", public_id: "resumes/new" });
      return new Writable({ write: (c, e, done) => done() });
    });
  const post = (token, buf = Buffer.from("pdf"), filename = "cv.pdf", contentType) =>
    request(app)
      .post("/api/resume/add")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", buf, contentType === undefined ? filename : { filename, contentType });
  const patch = (token, id, buf, filename) =>
    request(app)
      .patch(`/api/resume/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", buf, filename);
  const fill = (userId, n) =>
    Resume.insertMany(
      Array.from({ length: n }, (_, i) => ({ userId, name: `cv${i}.pdf`, fileUrl: "http://f.invalid/cv", cloudinaryId: `resumes/cv${i}` })),
    );
  const userWith = async (plan) => {
    const u = await makeUser(`${plan}-${Math.random()}@example.com`, plan);
    return { u, token: tokenFor(u) };
  };

  beforeEach(okUpload);
  afterEach(() => jest.restoreAllMocks());

  test("starter POST -> 403 and no upload", async () => {
    const { token } = await userWith("starter");
    const res = await post(token);
    expect(res.status).toBe(403);
    expect(res.body.message).toBeTruthy();
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  test("plan comes from the database, not the token", async () => {
    const { u } = await userWith("starter");
    const forged = jwt.sign({ id: u._id, email: u.email, plan: "executive" }, process.env.ACCESS_TOKEN_SECRET);
    expect((await post(forged)).status).toBe(403);
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  test("pro with 30 resumes -> 403, with 29 -> 201", async () => {
    const { u, token } = await userWith("pro");
    await fill(u._id, 30);
    const res = await post(token);
    expect(res.status).toBe(403);
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
    await Resume.deleteOne({ userId: u._id });
    expect((await post(token)).status).toBe(201);
  });

  test("executive with 100 resumes -> 403", async () => {
    const { u, token } = await userWith("executive");
    await fill(u._id, 100);
    expect((await post(token)).status).toBe(403);
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  test("unknown plan behaves like starter", async () => {
    const { u, token } = await userWith("starter");
    await User.collection.updateOne({ _id: u._id }, { $set: { plan: "platinum" } });
    expect((await post(token)).status).toBe(403);
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  test(".exe and PNG -> 400 with message, no upload", async () => {
    const { token } = await userWith("pro");
    for (const [name, type] of [["a.exe", "application/octet-stream"], ["a.png", "image/png"]]) {
      const res = await post(token, Buffer.from("x"), name, type);
      expect(res.status).toBe(400);
      expect(res.body.message).toBeTruthy();
    }
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  test("file over 4 MB -> 413 with message, no upload", async () => {
    const { token } = await userWith("pro");
    const res = await post(token, Buffer.alloc(4 * 1024 * 1024 + 1), "big.pdf", "application/pdf");
    expect(res.status).toBe(413);
    expect(res.body.message).toBeTruthy();
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  test("empty-MIME .docx passes", async () => {
    const { token } = await userWith("pro");
    expect((await post(token, Buffer.from("x"), "cv.docx", "")).status).toBe(201);
  });

  test("octet-stream MIME: .docx -> 201, .exe and .png -> 400", async () => {
    const { token } = await userWith("pro");
    const octet = "application/octet-stream";
    expect((await post(token, Buffer.from("x"), "cv.docx", octet)).status).toBe(201);
    cloudinary.uploader.upload_stream.mockClear();
    for (const name of ["a.exe", "a.png"]) {
      const res = await post(token, Buffer.from("x"), name, octet);
      expect(res.status).toBe(400);
      expect(res.body.message).toBeTruthy();
    }
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  test("starter with existing resumes can still GET them", async () => {
    const { u, token } = await userWith("starter");
    await fill(u._id, 2);
    const res = await request(app).get("/api/resume").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test("DELETE works for an over-limit user", async () => {
    const { u, token } = await userWith("pro");
    await fill(u._id, 31);
    const r = await Resume.findOne({ userId: u._id });
    const res = await request(app).delete(`/api/resume/${r._id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(await Resume.countDocuments({ userId: u._id })).toBe(30);
  });

  test("PATCH with a valid new file works for a starter owner", async () => {
    const { u, token } = await userWith("starter");
    const r = await makeResume(u._id);
    const res = await patch(token, r._id, Buffer.from("x"), "new.pdf");
    expect(res.status).toBe(200);
    expect((await Resume.findById(r._id)).cloudinaryId).toBe("resumes/new");
  });

  test("PATCH with a PNG -> 400, nothing uploaded", async () => {
    const { u, token } = await userWith("starter");
    const r = await makeResume(u._id);
    const res = await patch(token, r._id, Buffer.from("x"), "new.png");
    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });
});
