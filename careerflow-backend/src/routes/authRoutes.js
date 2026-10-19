const express = require("express");
const {
  sendRegistrationOTP,
  registerUser,
  googleSignIn,
  setGoogleUserPassword,
  loginUser,
  refreshTokenController,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { rateLimit, MINUTE, HOUR } = require("../middleware/rateLimit");

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No Token Required)
// ==========================================

// OTP & Registration Flow
router.post(
  "/send-otp",
  rateLimit("send-otp", [
    { by: "email", max: 3, windowMs: HOUR },
    { by: "ip", max: 10, windowMs: HOUR },
  ]),
  sendRegistrationOTP,
);
router.post("/register", rateLimit("register", [{ by: "ip", max: 10, windowMs: HOUR }]), registerUser);

// Login Flows
router.post("/login", rateLimit("login", [{ by: "ip", max: 10, windowMs: 15 * MINUTE }]), loginUser);
router.post("/google", rateLimit("google", [{ by: "ip", max: 20, windowMs: 15 * MINUTE }]), googleSignIn);

// Token Refresh 
router.get("/refresh-token", refreshTokenController); 

// Password Recovery
router.post(
  "/forgot-password",
  rateLimit("forgot-password", [
    { by: "email", max: 3, windowMs: HOUR },
    { by: "ip", max: 10, windowMs: HOUR },
  ]),
  forgotPassword,
);
router.patch("/reset-password/:token", resetPassword); 

// ==========================================
// PROTECTED ROUTES (Requires valid Access Token)
// ==========================================

// Profile Management
router.get("/me", protect, getMe); 
router.patch("/update-me", protect, updateMe); 

// Password Linking for Google Users
router.post("/set-password", protect, setGoogleUserPassword);

module.exports = router;
