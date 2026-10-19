const mongoose = require("mongoose");

// Last successful AI insight per user + board selection (boardId string or "all").
// Lives in the database because serverless instances share no memory.
const insightCacheSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  boardKey: { type: String, required: true },
  text: { type: String, required: true },
  generatedAt: { type: Date, required: true },
});
insightCacheSchema.index({ userId: 1, boardKey: 1 }, { unique: true });

module.exports = mongoose.model("InsightCache", insightCacheSchema);
