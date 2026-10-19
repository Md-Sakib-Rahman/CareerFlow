const request = require("supertest");
const jwt = require("jsonwebtoken");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const app = require("../src/app");
const dbConnect = require("../src/config/db");
const User = require("../src/models/User");
const Transaction = require("../src/models/Transaction");

// The controller built its Stripe client at require time; grab that mocked instance.
const stripe = require("stripe").mock.results[0].value;

beforeAll(async () => {
  await startDb();
  await Transaction.init(); // build the unique stripeSessionId index
});
afterAll(stopDb);

let user;
const tokenFor = (u) =>
  jwt.sign({ id: u._id, email: u.email, plan: u.plan }, process.env.ACCESS_TOKEN_SECRET);

beforeEach(async () => {
  await clearDb();
  jest.restoreAllMocks();
  dbConnect.mockClear();
  stripe.checkout.sessions.create.mockClear();
  stripe.webhooks.constructEvent.mockReset();
  user = await User.create({ name: "u", email: "u@example.com", passwordHash: "x", imageUrl: "http://img.invalid/a.png" });
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

// ---------------- S1 ----------------
describe("S1: cron secret", () => {
  const CRON = "/api/cron/send-daily-emails";
  const saved = process.env.CRON_SECRET;
  afterEach(() => { process.env.CRON_SECRET = saved; });

  test("unset secret -> refused (500) even with 'Bearer undefined', error logged", async () => {
    delete process.env.CRON_SECRET;
    const res = await request(app).get(CRON).set("Authorization", "Bearer undefined");
    expect(res.status).toBe(500);
    expect(console.error).toHaveBeenCalled();
  });

  test("wrong secret -> 401", async () => {
    const res = await request(app).get(CRON).set("Authorization", "Bearer wrong-secret!!");
    expect(res.status).toBe(401);
  });

  test("wrong secret of different length -> 401 (no throw)", async () => {
    const res = await request(app).get(CRON).set("Authorization", "Bearer x");
    expect(res.status).toBe(401);
  });

  test("missing header -> 401", async () => {
    expect((await request(app).get(CRON)).status).toBe(401);
  });

  test("correct secret -> 200", async () => {
    const res = await request(app).get(CRON).set("Authorization", `Bearer ${process.env.CRON_SECRET}`);
    expect(res.status).toBe(200);
  });
});

// ---------------- S9 checkout ----------------
describe("S9: checkout planType", () => {
  const post = (body) =>
    request(app)
      .post("/api/payments/create-checkout-session")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send(body);

  test("planType 'enterprise' -> 400, Stripe not called", async () => {
    const res = await post({ planType: "enterprise" });
    expect(res.status).toBe(400);
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
  });

  test("missing planType defaults to pro", async () => {
    const res = await post({});
    expect(res.status).toBe(200);
    expect(stripe.checkout.sessions.create.mock.calls[0][0].metadata.purchasedPlan).toBe("pro");
  });

  test("executive accepted", async () => {
    const res = await post({ planType: "executive" });
    expect(res.status).toBe(200);
    expect(stripe.checkout.sessions.create.mock.calls[0][0].metadata.purchasedPlan).toBe("executive");
  });
});

// ---------------- webhook ----------------
const makeEvent = (plan, sessionId = "cs_1", userId = () => user._id) => ({
  type: "checkout.session.completed",
  data: {
    object: {
      id: sessionId,
      client_reference_id: String(userId()),
      amount_total: 999,
      metadata: plan === undefined ? {} : { purchasedPlan: plan },
    },
  },
});
const sendWebhook = (event) => {
  stripe.webhooks.constructEvent.mockReturnValue(event);
  return request(app)
    .post("/api/payments/webhook")
    .set("Content-Type", "application/json")
    .set("stripe-signature", "sig")
    .send("{}");
};
const planOf = async () => (await User.findById(user._id)).plan;

describe("S9: webhook plan whitelist", () => {
  test.each(["admin", "enterprise", undefined])("invalid purchasedPlan %p -> 200, plan unchanged, no Transaction", async (p) => {
    const res = await sendWebhook(makeEvent(p));
    expect(res.status).toBe(200);
    expect(await planOf()).toBe("starter");
    expect(await Transaction.countDocuments()).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });

  test("runValidators is passed to the user update", async () => {
    const spy = jest.spyOn(User, "findOneAndUpdate");
    await sendWebhook(makeEvent("pro"));
    expect(spy.mock.calls[0][2]).toMatchObject({ runValidators: true });
  });
});

describe("S10: webhook error handling", () => {
  test("normal event -> 200, plan upgraded, Transaction stored", async () => {
    const res = await sendWebhook(makeEvent("pro"));
    expect(res.status).toBe(200);
    expect(await planOf()).toBe("pro");
    expect(await Transaction.countDocuments({ stripeSessionId: "cs_1" })).toBe(1);
  });

  test("replay of pro event after user bought executive -> 200, stays executive", async () => {
    await sendWebhook(makeEvent("pro", "cs_1"));
    await sendWebhook(makeEvent("executive", "cs_2"));
    expect(await planOf()).toBe("executive");
    const res = await sendWebhook(makeEvent("pro", "cs_1")); // Stripe retry of the first event
    expect(res.status).toBe(200);
    expect(await planOf()).toBe("executive");
  });

  test("update failure -> 500, row stays pending, retry upgrades and marks completed", async () => {
    jest.spyOn(User, "findOneAndUpdate").mockRejectedValueOnce(new Error("db down"));
    const res = await sendWebhook(makeEvent("pro"));
    expect(res.status).toBe(500);
    expect((await Transaction.findOne({ stripeSessionId: "cs_1" })).status).toBe("pending");
    expect(await planOf()).toBe("starter");

    const retry = await sendWebhook(makeEvent("pro"));
    expect(retry.status).toBe(200);
    expect(await planOf()).toBe("pro");
    expect(await Transaction.countDocuments({ stripeSessionId: "cs_1" })).toBe(1);
    expect((await Transaction.findOne({ stripeSessionId: "cs_1" })).status).toBe("completed");
  });

  test("duplicate of a pending row whose retry update also fails -> 500, still pending", async () => {
    await Transaction.create({ user: user._id, stripeSessionId: "cs_1", amount: 9.99, status: "pending" });
    jest.spyOn(User, "findOneAndUpdate").mockRejectedValueOnce(new Error("db down"));
    const res = await sendWebhook(makeEvent("pro"));
    expect(res.status).toBe(500);
    expect((await Transaction.findOne({ stripeSessionId: "cs_1" })).status).toBe("pending");
  });

  test("bad signature -> 400", async () => {
    stripe.webhooks.constructEvent.mockImplementation(() => { throw new Error("bad sig"); });
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "bad")
      .send("{}");
    expect(res.status).toBe(400);
  });

  test("bad signature -> 400 with fixed message, no raw error text", async () => {
    stripe.webhooks.constructEvent.mockImplementation(() => { throw new Error("secret-detail"); });
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "bad")
      .send("{}");
    expect(res.status).toBe(400);
    expect(res.text).not.toContain("secret-detail");
    expect(res.text).toContain("Webhook signature verification failed");
    expect(console.error).toHaveBeenCalled();
  });

  test("pending pro row retried after user bought executive -> 200, stays executive, row completed", async () => {
    await User.updateOne({ _id: user._id }, { plan: "executive" });
    await Transaction.create({ user: user._id, stripeSessionId: "cs_1", amount: 9.99, status: "pending" });
    const res = await sendWebhook(makeEvent("pro"));
    expect(res.status).toBe(200);
    expect(await planOf()).toBe("executive");
    expect((await Transaction.findOne({ stripeSessionId: "cs_1" })).status).toBe("completed");
  });

  test("new pro purchase by an executive user never lowers the plan", async () => {
    await User.updateOne({ _id: user._id }, { plan: "executive" });
    const res = await sendWebhook(makeEvent("pro"));
    expect(res.status).toBe(200);
    expect(await planOf()).toBe("executive");
    expect((await Transaction.findOne({ stripeSessionId: "cs_1" })).status).toBe("completed");
  });

  test("executive purchase by a pro user -> executive", async () => {
    await User.updateOne({ _id: user._id }, { plan: "pro" });
    expect((await sendWebhook(makeEvent("executive"))).status).toBe(200);
    expect(await planOf()).toBe("executive");
  });

  test("pro purchase by a starter user -> pro", async () => {
    expect((await sendWebhook(makeEvent("pro"))).status).toBe(200);
    expect(await planOf()).toBe("pro");
  });
});

describe("S11: webhook DB connection", () => {
  test("dbConnect is called before the first model call", async () => {
    const txSpy = jest.spyOn(Transaction, "create");
    await sendWebhook(makeEvent("pro"));
    expect(dbConnect).toHaveBeenCalled();
    expect(dbConnect.mock.invocationCallOrder[0]).toBeLessThan(txSpy.mock.invocationCallOrder[0]);
  });

  test("bad signature -> 400 without calling dbConnect", async () => {
    stripe.webhooks.constructEvent.mockImplementation(() => { throw new Error("bad sig"); });
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "bad")
      .send("{}");
    expect(res.status).toBe(400);
    expect(dbConnect).not.toHaveBeenCalled();
  });

  test("dbConnect failure -> 500", async () => {
    dbConnect.mockRejectedValueOnce(new Error("no db"));
    const res = await sendWebhook(makeEvent("pro"));
    expect(res.status).toBe(500);
  });
});
