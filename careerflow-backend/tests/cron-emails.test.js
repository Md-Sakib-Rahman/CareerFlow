const request = require("supertest");
const mongoose = require("mongoose");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const User = require("../src/models/User");
const Board = require("../src/models/Board");
const Job = require("../src/models/Job");
const Reminder = require("../src/models/Reminder");
const { sendNotificationEmail } = require("../src/utils/email");

jest.mock("../src/utils/email", () => ({ sendNotificationEmail: jest.fn() }));

beforeAll(startDb);
afterAll(stopDb);

const CRON = "/api/cron/send-daily-emails";
const run = () => request(app).get(CRON).set("Authorization", `Bearer ${process.env.CRON_SECRET}`);

const makeUser = (plan, email = `${plan}@example.com`) =>
  User.create({ name: "u", email, passwordHash: "x", imageUrl: "http://img.invalid/a.png", plan });

const makeReminder = async (user, { orphan = false } = {}) => {
  const board = await Board.create({ userId: user._id, name: "b" });
  const job = await Job.create({
    userId: user._id, boardId: board._id, columnId: board.columns[0]._id,
    company: "Acme", title: "Dev", status: "wishlist",
  });
  const reminder = await Reminder.create({
    userId: user._id, jobId: job._id, type: "apply",
    reminderDate: new Date(Date.now() - 1000), targetDate: new Date(Date.now() + 86400000),
  });
  if (orphan) await Job.deleteOne({ _id: job._id });
  return reminder;
};

beforeEach(async () => {
  await clearDb();
  sendNotificationEmail.mockReset();
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

test("failed email leaves the reminder active and not notified", async () => {
  const r = await makeReminder(await makeUser("pro"));
  sendNotificationEmail.mockResolvedValue(false);
  await run();
  const after = await Reminder.findById(r._id);
  expect(after.isActive).toBe(true);
  expect(after.isNotified).toBe(false);
});

test("one failure does not stop the others", async () => {
  const a = await makeReminder(await makeUser("pro", "a@example.com"));
  const b = await makeReminder(await makeUser("executive", "b@example.com"));
  sendNotificationEmail.mockImplementation(async (to) => {
    if (to === "a@example.com") throw new Error("boom");
    return true;
  });
  const res = await run();
  expect(res.status).toBe(200);
  expect((await Reminder.findById(b._id)).isNotified).toBe(true);
  expect((await Reminder.findById(a._id)).isNotified).toBe(false);
});

test("starter user's reminder is skipped and left untouched", async () => {
  const r = await makeReminder(await makeUser("starter"));
  await run();
  expect(sendNotificationEmail).not.toHaveBeenCalled();
  const after = await Reminder.findById(r._id);
  expect(after.isActive).toBe(true);
  expect(after.isNotified).toBe(false);
});

test("orphaned reminder (job deleted) is deactivated", async () => {
  const r = await makeReminder(await makeUser("pro"), { orphan: true });
  await run();
  expect(sendNotificationEmail).not.toHaveBeenCalled();
  expect((await Reminder.findById(r._id)).isActive).toBe(false);
});

test("reminder whose user no longer exists is deactivated and counted as skipped", async () => {
  const user = await makeUser("pro");
  const r = await makeReminder(user);
  await User.deleteOne({ _id: user._id });
  const res = await run();
  expect(sendNotificationEmail).not.toHaveBeenCalled();
  expect((await Reminder.findById(r._id)).isActive).toBe(false);
  expect(res.body.skipped).toBe(1);
});

test("normal response keeps the original message text plus counts", async () => {
  await makeReminder(await makeUser("pro"));
  sendNotificationEmail.mockResolvedValue(true);
  const res = await run();
  expect(res.body.message).toBe("Cron executed. Sent 1 emails.");
  expect(res.body).toMatchObject({ sent: 1, failed: 0, skipped: 0 });
});

test("response has sent/failed/skipped counts", async () => {
  await makeReminder(await makeUser("pro", "ok@example.com"));
  await makeReminder(await makeUser("pro", "bad@example.com"));
  await makeReminder(await makeUser("starter", "s@example.com"));
  sendNotificationEmail.mockImplementation(async (to) => to === "ok@example.com");
  const res = await run();
  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({ success: true, sent: 1, failed: 1, skipped: 1 });
});
