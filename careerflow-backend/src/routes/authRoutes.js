const express = require("express");
const {
  registerUser,
  loginUser,
  refreshTokenController,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refreshtoken", refreshTokenController);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe); // 'protect' middleware to ensure user is authenticated before accessing this route
router.post("/updateMe", protect, updateMe);

module.exports = router;
