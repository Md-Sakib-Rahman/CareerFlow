const request = require("supertest");
const jwt = require("jsonwebtoken");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");
const Board = require("../src/models/Board");
const Job = require("../src/models/Job");
const Reminder = require("../src/models/Reminder");
const Resume = require("../src/models/Resume");

const SECRET = "mongodb://user:pass@host";
const boom = () => {
  throw new Error(SECRET);
};

beforeAll(startDb);
afterAll(stopDb);
beforeEach(async () => {
  await clearDb();
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

const makeUser = (plan = "pro") =>
  User.create({ name: "u", email: `${plan}@example.com`, passwordHash: "x", imageUrl: "http://img.invalid/a.png", plan });
const tokenFor = (u) => jwt.sign({ id: u._id, email: u.email, plan: u.plan }, process.env.ACCESS_TOKEN_SECRET);
const auth = (t) => ({ Authorization: `Bearer ${t}` });

const expectGeneric500 = (res) => {
  expect(res.status).toBe(500);
  expect(JSON.stringify(res.body)).not.toContain(SECRET);
  expect(res.body).not.toHaveProperty("error");
  expect(res.body.message).toEqual(expect.any(String));
};

describe("S13: 500 responses do not leak internal error text", () => {
  test("boards: GET /api/boards", async () => {
    const t = tokenFor(await makeUser());
    jest.spyOn(Board, "find").mockImplementation(boom);
    expectGeneric500(await request(app).get("/api/boards").set(auth(t)));
  });

  test("jobs: GET /api/jobs/board/:boardId", async () => {
    const t = tokenFor(await makeUser());
    jest.spyOn(Job, "find").mockImplementation(boom);
    expectGeneric500(await request(app).get("/api/jobs/board/507f1f77bcf86cd799439011").set(auth(t)));
  });

  test("reminders: GET /api/reminders/notifications", async () => {
    const t = tokenFor(await makeUser());
    jest.spyOn(Reminder, "find").mockImplementation(boom);
    expectGeneric500(await request(app).get("/api/reminders/notifications").set(auth(t)));
  });

  test("analytics: GET /api/analytics", async () => {
    const t = tokenFor(await makeUser());
    jest.spyOn(Board, "find").mockImplementation(boom);
    expectGeneric500(await request(app).get("/api/analytics").set(auth(t)));
  });

  test("resume routes: GET /api/resume", async () => {
    const t = tokenFor(await makeUser());
    jest.spyOn(Resume, "find").mockImplementation(boom);
    expectGeneric500(await request(app).get("/api/resume").set(auth(t)));
  });

  test("auth: POST /auth/set-password", async () => {
    const t = tokenFor(await makeUser("starter"));
    jest.spyOn(User, "findById").mockImplementation(boom);
    expectGeneric500(await request(app).post("/auth/set-password").set(auth(t)).send({ newPassword: "Abcdef1!x" }));
  });

  test("authMiddleware: bad token stays 401 with the same message and no error field", async () => {
    const res = await request(app).get("/api/boards").set(auth("not-a-jwt"));
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Not authorized, token failed or expired");
    expect(res.body).not.toHaveProperty("error");
  });

  test("the real error is still logged server-side", async () => {
    const t = tokenFor(await makeUser());
    jest.spyOn(Board, "find").mockImplementation(boom);
    await request(app).get("/api/boards").set(auth(t));
    expect(console.error).toHaveBeenCalled();
  });
});

describe("S13: existing 4xx messages are unchanged", () => {
  test("no token -> 401 'Not authorized, no token provided'", async () => {
    const res = await request(app).get("/api/boards");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token provided");
  });

  test("unknown board primary -> 404 'Board not found'", async () => {
    const t = tokenFor(await makeUser());
    const res = await request(app).patch("/api/boards/507f1f77bcf86cd799439011/primary").set(auth(t));
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Board not found");
  });

  test("starter on analytics -> 403 paywall message", async () => {
    const t = tokenFor(await makeUser("starter"));
    const res = await request(app).get("/api/analytics").set(auth(t));
    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Premium Feature: Please upgrade to Pro or Executive to access this.");
  });
});
