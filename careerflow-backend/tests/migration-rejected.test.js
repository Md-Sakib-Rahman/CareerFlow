const mongoose = require("mongoose");
const { startDb, clearDb, stopDb } = require("./helpers/db");
const Board = require("../src/models/Board");
const { addRejectedColumn } = require("../scripts/add-rejected-column");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const four = [
  { title: "Wishlist", internalStatus: "wishlist", position: 0 },
  { title: "Applied", internalStatus: "applied", position: 1 },
  { title: "Interviewing", internalStatus: "interviewing", position: 2 },
  { title: "Offers", internalStatus: "offer", position: 3 },
];
const seed = async () => {
  const userId = new mongoose.Types.ObjectId();
  const old = await Board.create({ userId, name: "old", columns: four });
  const full = await Board.create({ userId, name: "full" }); // schema default
  return { old, full };
};

describe("L1: add-rejected-column migration logic", () => {
  test("adds Rejected to a board that lacks one, leaves complete boards untouched", async () => {
    const { old, full } = await seed();
    const fullBefore = JSON.stringify((await Board.findById(full._id)).toObject());
    const res = await addRejectedColumn();
    expect(res).toMatchObject({ total: 2, missing: 1, updated: 1 });

    const after = await Board.findById(old._id);
    expect(after.columns).toHaveLength(5);
    const last = after.columns[4];
    expect(last.internalStatus).toBe("rejected");
    expect(last.position).toBe(4);
    expect(after.columns.slice(0, 4).map((c) => c.title)).toEqual(four.map((c) => c.title));
    expect(JSON.stringify((await Board.findById(full._id)).toObject())).toBe(fullBefore);
  });

  test("dryRun only reports counts", async () => {
    const { old } = await seed();
    const res = await addRejectedColumn({ dryRun: true });
    expect(res).toMatchObject({ total: 2, missing: 1, updated: 0, dryRun: true });
    expect((await Board.findById(old._id)).columns).toHaveLength(4);
  });

  test("idempotent", async () => {
    await seed();
    await addRejectedColumn();
    const again = await addRejectedColumn();
    expect(again).toMatchObject({ missing: 0, updated: 0 });
  });
});
