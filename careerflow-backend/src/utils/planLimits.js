// Single source of truth for per-plan limits. Infinity = unlimited.
// Limits only block creation; existing data is never deleted on downgrade.
const LIMITS = {
  starter: { boards: 1, jobs: 20, resumes: 0 },
  pro: { boards: 10, jobs: Infinity, resumes: 30 },
  executive: { boards: Infinity, jobs: Infinity, resumes: 100 },
};

// Unknown or missing plans get the starter limits.
const getPlanLimits = (plan) =>
  Object.prototype.hasOwnProperty.call(LIMITS, plan) ? LIMITS[plan] : LIMITS.starter;

module.exports = { getPlanLimits };
