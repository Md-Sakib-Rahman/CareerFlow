const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/paymentController');

// ⚠️ IMPORTANT: Import your authentication middleware here. 
// I am assuming your middleware is named 'protect' or 'verifyToken'. 
// Adjust the path and variable name to match your actual auth middleware.
const { protect } = require('../middleware/authMiddleware'); 

// @route   POST /api/payments/create-checkout-session
// @desc    Generates the Stripe hosted checkout URL
// @access  Private (User must be logged in)
router.post('/create-checkout-session', protect, createCheckoutSession);

module.exports = router;