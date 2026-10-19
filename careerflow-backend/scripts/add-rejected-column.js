// One-off, additive migration: append a "Rejected" column to boards that lack one.
// Never deletes or modifies existing columns. Does nothing on import.
//
// Run by hand only:  MONGO_URL=... node scripts/add-rejected-column.js [--dry-run]

const Board = require("../src/models/Board");

const REJECTED_COLUMN = { title: "Rejected", internalStatus: "rejected", color: "#ef4444" };

// Works on the already-connected mongoose instance.
const addRejectedColumn = async ({ dryRun = false } = {}) => {
  const total = await Board.countDocuments();
  const boards = await Board.find({ "columns.internalStatus": { $ne: "rejected" } });
  let updated = 0;

  if (!dryRun) {
    for (const board of boards) {
      const position = board.columns.reduce((max, c) => Math.max(max, c.position), -1) + 1;
      const res = await Board.updateOne(
        { _id: board._id, "columns.internalStatus": { $ne: "rejected" } },
        { $push: { columns: { ...REJECTED_COLUMN, position } } }
      );
      updated += res.modifiedCount;
    }
  }

  return { total, missing: boards.length, updated, dryRun };
};

if (require.main === module) {
  const mongoose = require("mongoose");
  const dryRun = process.argv.includes("--dry-run");
  (async () => {
    if (!process.env.MONGO_URL) throw new Error("MONGO_URL is not set");
    await mongoose.connect(process.env.MONGO_URL);
    const result = await addRejectedColumn({ dryRun });
    console.log(result);
    await mongoose.disconnect();
  })().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { addRejectedColumn };
