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

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No Token Required)
// ==========================================

// OTP & Registration Flow
router.post("/send-otp", sendRegistrationOTP);
router.post("/register", registerUser);

// Login Flows
router.post("/login", loginUser);
router.post("/google", googleSignIn);

// Token Refresh 
router.get("/refresh-token", refreshTokenController); 

// Password Recovery
router.post("/forgot-password", forgotPassword);
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
