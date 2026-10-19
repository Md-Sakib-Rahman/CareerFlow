const mongoose = require("mongoose");

// One document per scope + identifier. The TTL index only cleans up old
// documents; the limiter itself decides whether a window has expired.
const rateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

module.exports = mongoose.model("RateLimit", rateLimitSchema);
