const express = require("express");
const router = express.Router();

// 1. Destructure imports carefully (Ensure names match the controller exports exactly)
const { getAnalytics } = require("../controllers/analyticsController");
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

module.exports = router;
// const express = require("express");
// const router = express.Router();
// const { getAnalytics } = require("../controllers/analyticsController");
// const { protect } = require("../middleware/authMiddleware"); // protect middleware to ensure routes are private

// // @route   GET /api/analytics
// // @desc    Get job application analytics
// // @access  Private
// router.get("/", protect, getAnalytics);

// module.exports = router;