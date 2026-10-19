const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

let token;
beforeEach(async () => {
  const u = await User.create({
    name: "u", email: "pro@example.com", passwordHash: "x", imageUrl: "http://img.invalid/a.png", plan: "pro",
  });
  token = jwt.sign({ id: u._id, email: u.email, plan: u.plan }, process.env.ACCESS_TOKEN_SECRET);
});
const auth = (r) => r.set("Authorization", `Bearer ${token}`);

describe("L16: malformed ids -> 400", () => {
  test("GET /api/jobs/board/not-an-id", async () => {
    expect((await auth(request(app).get("/api/jobs/board/not-an-id"))).status).toBe(400);
  });
  test("analytics boardId=bad -> 400, boardId=all -> 200", async () => {
    expect((await auth(request(app).get("/api/analytics?boardId=bad"))).status).toBe(400);
    expect((await auth(request(app).get("/api/analytics?boardId=all"))).status).toBe(200);
  });
  test("PATCH /api/boards/x/columns", async () => {
    expect((await auth(request(app).patch("/api/boards/x/columns")).send({ columns: [] })).status).toBe(400);
  });
  test("PATCH and DELETE /api/resume/not-an-id", async () => {
    expect((await auth(request(app).patch("/api/resume/not-an-id")).send({ type: "x" })).status).toBe(400);
    expect((await auth(request(app).delete("/api/resume/not-an-id"))).status).toBe(400);
  });
});

describe("L16: error middleware", () => {
  const errorHandler = () => require("../src/middleware/errorHandler");
  const appThrowing = (err) => {
    const a = express();
    a.get("/boom", (req, res, next) => next(err));
    a.use(errorHandler()());
    return a;
  };
  test("CastError -> 400", async () => {
    const err = new mongoose.Error.CastError("ObjectId", "x", "_id");
    const res = await request(appThrowing(err)).get("/boom");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  test("CastError -> 400 with fixed message, no Mongoose text", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const err = new mongoose.Error.CastError("ObjectId", "secret-detail", "_id");
    const res = await request(appThrowing(err)).get("/boom");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Invalid request data" });
    expect(JSON.stringify(res.body)).not.toContain("secret-detail");
    expect(console.error).toHaveBeenCalled();
  });
  test("ValidationError -> 400", async () => {
    const err = new mongoose.Error.ValidationError();
    const res = await request(appThrowing(err)).get("/boom");
    expect(res.status).toBe(400);
  });
  test("other errors pass through (500)", async () => {
    const res = await request(appThrowing(new Error("x"))).get("/boom");
    expect(res.status).toBe(500);
  });
});
