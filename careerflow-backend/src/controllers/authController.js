const generateTokens = require("../utils/generateToken");
const User = require("../models/User");
const Board = require("../models/Board");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================================
// HELPER: Auto-Create Default Board
// ==========================================
const createDefaultBoard = async (userId) => {
  try {
    await Board.create({
      userId: userId,
      name: "My Job Search",
      columns: [
        { title: "Wishlist", internalStatus: "wishlist", position: 0 },
        { title: "Applied", internalStatus: "applied", position: 1 },
        { title: "Interviewing", internalStatus: "interviewing", position: 2 },
        { title: "Offer", internalStatus: "offer", position: 3 },
        { title: "Rejected", internalStatus: "rejected", position: 4 }
      ]
    });
    console.log(`Default board created for user: ${userId}`);
  } catch (error) {
    console.error("Failed to create default board:", error.message);
  }
};
// ==========================================

const sendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.authProvider === "google") {
        return res.status(400).json({
          success: false,
          message:
            "This Gmail is registered via Google. Please use Google Sign-In.",
        });
      }
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp: otpCode });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: `"CareerFlow Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your CareerFlow Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #9333ea;">Welcome to CareerFlow!</h2>
            <p>Please use the following One-Time Password (OTP) to complete your registration:</p>
            <h1 style="letter-spacing: 5px; color: #111;">${otpCode}</h1>
            <p><em>This code is valid for 5 minutes.</em></p>
        </div>
    `,
    };
    await transporter.sendMail(mailOptions);

    console.log(`MOCK EMAIL SENT TO ${email}: OTP is ${otpCode}`);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, plan, industries, imageUrl, otp } = req.body;
    const isExist = await User.findOne({ email });
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const newUser = new User({
      name,
      email,
      passwordHash: hash,
      plan,
      industries,
      imageUrl,
      authProvider: 'local'
    });

    const savedUser = await newUser.save();

    // --> INJECTED: Create the default Kanban board for standard registration <--
    await createDefaultBoard(savedUser._id);

    await Otp.deleteMany({ email });
    const { accessToken, refreshToken } = generateTokens(savedUser);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    return res
      .status(201)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        success: true,
        message: "User Created Successfully",
        accessToken,
        data: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          plan: savedUser.plan,
          imageUrl: savedUser.imageUrl,
          industries: savedUser.industries
        },
      });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * @desc    Google Sign-In / Sign-Up
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleSignIn = async (req, res) => {
  try {
    // 1. Receive the token from frontend (it's actually an access_token)
    const { idToken: accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: "No token provided" });
    }

    // 2. Exchange the Access Token for User Info manually via Google API
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );

    const { email, name, picture } = googleResponse.data;

    // 3. Find or Create User
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(20).toString('hex');
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(randomPassword, salt);

      user = await User.create({
        name,
        email,
        passwordHash: hash,
        imageUrl: picture,
        authProvider: 'google',
        plan: 'starter',
        industries: []
      });

      await createDefaultBoard(user._id);
    }

    // 4. Generate CareerFlow Tokens
    const { accessToken: careerFlowToken, refreshToken } = generateTokens(user);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    };

    return res.status(200).cookie("refreshToken", refreshToken, cookieOptions).json({
      success: true,
      message: "Google Sign-In Successful",
      accessToken: careerFlowToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        imageUrl: user.imageUrl,
        industries: user.industries || [],
        authProvider: user.authProvider
      }
    });

  } catch (err) {
    console.error("Google Auth Error:", err.response?.data || err.message);
    return res.status(401).json({
      success: false,
      message: "Google Authentication failed. Please try again."
    });
  }
};
const setGoogleUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.authProvider !== 'google') {
      return res.status(400).json({
        success: false,
        message: "This account already has a password. Please use the Change Password feature instead."
      });
    }

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);

    user.authProvider = 'both';

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password set successfully. You can now log in using Google or your Email/Password."
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("no user found")
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Account restricted! Try again in a few minutes.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      console.log("LOGIN FAILED: Passwords do not match")
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 3) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
        user.failedLoginAttempts = 0;
      }

      await user.save();
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    console.log(refreshToken);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        success: true,
        message: "User Logged in Successfully",
        accessToken,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          imageUrl: user.imageUrl,
          authProvider: user.authProvider
        },
      });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token",
          });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
          return res
            .status(403)
            .json({ success: false, message: "Account is restricted" });
        }

        const { accessToken } = generateTokens(user);

        return res.status(200).json({
          success: true,
          accessToken,
        });
      },
    );
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          industries: user.industries,
          imageUrl: user.imageUrl,
          plan: user.plan,
          authProvider: user.authProvider
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

{/*const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.industries = req.body.industries || user.industries;
      user.imageUrl = req.body.imageUrl || user.imageUrl;

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          industries: updatedUser.industries,
          imageUrl: updatedUser.imageUrl,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};*/}

const updateMe = async (req, res) => {
  try {
    const { name, email, industries, imageUrl } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent email duplication
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      user.email = email;
    }

    if (name) user.name = name;
    if (industries) user.industries = industries;
    if (imageUrl) user.imageUrl = imageUrl;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        industries: updatedUser.industries,
        imageUrl: updatedUser.imageUrl,
        plan: updatedUser.plan,
        authProvider: updatedUser.authProvider
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CareerFlow Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "CareerFlow Password Reset",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e0e0e0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #9333ea; font-size: 28px; font-weight: 800; margin: 0;">CareerFlow</h1>
            </div>
            <div style="color: #1a1a1b; line-height: 1.6;">
                <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin-top: 0;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset the password for your CareerFlow account. No problem, we've got you covered!</p>
                <p>Click the secure button below to choose a new password. This link will expire in <strong>10 minutes</strong>.</p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${resetUrl}" style="background-color: #9333ea; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; display: inline-block; transition: background-color 0.3s ease;">Reset My Password</a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; 2024 CareerFlow. All rights reserved.</p>
            </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === "development") {
      return res.status(200).json({
        success: true,
        message: "Email sent. (DEV MODE: URL included below)",
        resetUrl: resetUrl
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent."
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(req.body.password, salt);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

module.exports = {
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
};