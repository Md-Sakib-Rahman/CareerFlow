const Job = require("../models/Job");

const GHOSTED_DAYS = 14;

// Ghosted = still "applied" and applied more than 14 days ago. Wishlist jobs are never ghosted.
const countGhosted = (match) =>
  Job.countDocuments({
    ...match,
    status: "applied",
    "dates.appliedAt": { $lt: new Date(Date.now() - GHOSTED_DAYS * 24 * 60 * 60 * 1000) },
  });

module.exports = { GHOSTED_DAYS, countGhosted };
