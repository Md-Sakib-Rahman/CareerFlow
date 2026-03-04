const User = require('../models/User');

/**
 * Middleware to block "starter" accounts from accessing premium routes.
 * Must be used AFTER your standard auth middleware (protect).
 */
const requirePro = async (req, res, next) => {
  try {
    // 1. Safely grab the ID from your previous auth middleware
    const userId = req.user._id || req.user.id;
    
    // 2. Fetch the fresh user from the database to ensure we have their latest plan
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. THE PAYWALL
    if (user.plan === 'starter') {
      return res.status(403).json({ 
        success: false, 
        message: "Premium Feature: Please upgrade to Pro or Executive to access this." 
      });
    }

    // 4. If they are 'pro' or 'executive', let the request continue to the controller!
    next();
  } catch (error) {
    console.error("Paywall Middleware Error:", error);
    res.status(500).json({ success: false, message: "Server Error verifying subscription status." });
  }
};

module.exports = { requirePro };