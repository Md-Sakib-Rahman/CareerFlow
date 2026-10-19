const RateLimit = require("../models/RateLimit");

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const identifierFor = (by, req) => {
  if (by === "ip") return req.ip;
  if (by === "email") {
    const email = req.body && req.body.email;
    // Non-string emails are rejected by the controller; do not count them here.
    return typeof email === "string" ? email.trim().toLowerCase() : null;
  }
  return null;
};

// Single atomic upsert: a new or expired window restarts at count 1 with a new
// expiresAt; otherwise count + 1 and expiresAt is left unchanged.
const hit = (key, windowMs) => {
  const now = new Date();
  const live = { $gt: ["$expiresAt", now] };
  return RateLimit.findOneAndUpdate(
    { key },
    [
      {
        $set: {
          count: { $cond: [live, { $add: ["$count", 1] }, 1] },
          expiresAt: { $cond: [live, "$expiresAt", new Date(now.getTime() + windowMs)] },
        },
      },
    ],
    { upsert: true, returnDocument: "after", updatePipeline: true },
  );
};

// rules: [{ by: "ip" | "email", max, windowMs }]
const rateLimit = (scope, rules) => async (req, res, next) => {
  try {
    let retryAfter = 0;
    for (const { by, max, windowMs } of rules) {
      const id = identifierFor(by, req);
      if (!id) continue;
      const doc = await hit(`${scope}:${by}:${id}`, windowMs);
      if (doc.count > max) {
        retryAfter = Math.max(retryAfter, Math.ceil((doc.expiresAt.getTime() - Date.now()) / 1000));
      }
    }
    if (retryAfter > 0) {
      res.set("Retry-After", String(retryAfter));
      return res
        .status(429)
        .json({ success: false, message: "Too many requests. Please try again later." });
    }
  } catch (err) {
    // Fail open: an infrastructure problem must not lock users out.
    console.error("Rate limiter error (failing open):", err.message);
  }
  next();
};

module.exports = { rateLimit, MINUTE, HOUR };
