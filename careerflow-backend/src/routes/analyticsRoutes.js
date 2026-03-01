const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware"); // protect middleware to ensure routes are private

// @route   GET /api/analytics
// @desc    Get job application analytics
// @access  Private
router.get("/", protect, getAnalytics);

module.exports = router;