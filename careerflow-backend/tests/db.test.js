const mongoose = require("mongoose");
const { startDb, stopDb } = require("./helpers/db");

beforeAll(startDb);
afterAll(stopDb);

test("in-memory MongoDB: insert and read one document", async () => {
  const Probe = mongoose.model("Probe", new mongoose.Schema({ name: String }));
  await Probe.create({ name: "hello" });
  const found = await Probe.findOne({ name: "hello" });
  expect(found.name).toBe("hello");
});

test("guard rejects non-local connections", () => {
  expect(() => mongoose.connect("mongodb+srv://user:pw@cluster.example.invalid/db")).toThrow(/127\.0\.0\.1/);
});
