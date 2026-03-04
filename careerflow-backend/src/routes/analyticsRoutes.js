const express = require("express");
const router = express.Router();

// 1. Destructure imports carefully (Ensure names match the controller exports exactly)
const { getAnalytics, getAiInsights } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { requirePro } = require("../middleware/paywallMiddleware");

/**
 * @route   GET /api/analytics
 * @desc    Fetch aggregated job application metrics, conversion rates, and activity
 * @access  Private (Requires valid JWT)
 * @query   {string} boardId - Optional. Filters analytics by a specific board ID. Use 'all' for global.
 */
 
router.get(
  "/", 
  protect, // Middleware 1: Authentication
  requirePro,
  getAnalytics // Final Handler: Data Aggregation
);
router.get("/ai-insights", protect, requirePro, getAiInsights);

module.exports = router;
 