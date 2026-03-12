const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// DB
const dbConnect = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const boardRoutes = require("./routes/boardRoutes");
const jobRoutes = require("./routes/jobRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const resumeRoutes = require("./routes/resumeRoutes"); // ⭐ Resume Vault

// Controllers
const { handleStripeWebhook } = require("./controllers/paymentController");

// Models
const Reminder = require("./models/Reminder");

// Utils
const { sendNotificationEmail } = require("./utils/email");
const { generateEmailHtml } = require("./utils/emailTemplates");

const app = express();

// ==========================
// CORS CONFIG
// ==========================

const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? true
      : [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "https://career-flow-six.vercel.app",
        ],

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

// Security headers

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

  next();
});

// ==========================
// GLOBAL MIDDLEWARE
// ==========================

app.use(cors(corsOptions));

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

app.use(express.json());

app.use(cookieParser());

// ==========================
// DB CONNECTION MIDDLEWARE
// ==========================

app.use(async (req, res, next) => {
  try {
    await dbConnect();

    next();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }
});

// ==========================
// ROUTES
// ==========================

app.use("/auth", authRoutes);

app.use("/api/boards", boardRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/reminders", reminderRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/resume", resumeRoutes); // ⭐ Resume Vault API

// ==========================
// DAILY EMAIL CRON ENDPOINT
// ==========================

app.get("/api/cron/send-daily-emails", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const now = new Date();

    const pendingReminders = await Reminder.find({
      isActive: true,

      isNotified: false,

      reminderDate: { $lte: now },
    })
      .populate("userId", "name email")
      .populate("jobId", "title company");

    if (pendingReminders.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No pending reminders found." });
    }

    const emailPromises = pendingReminders.map(async (reminder) => {
      if (!reminder.userId || !reminder.jobId) return;

      const { email, name } = reminder.userId;

      const { title, company } = reminder.jobId;

      const formattedTargetDate = new Date(
        reminder.targetDate,
      ).toLocaleDateString();

      let subject = "";

      switch (reminder.type) {
        case "interview":
          subject = `Upcoming Interview: ${title} at ${company}`;
          break;

        case "apply":
          subject = `Application Deadline Approaching: ${title}`;
          break;

        case "follow-up":
          subject = `Time to Follow Up: ${title} at ${company}`;
          break;
      }

      const htmlBody = generateEmailHtml(
        name,
        title,
        company,
        formattedTargetDate,
        reminder.type,
      );

      await sendNotificationEmail(
        email,
        subject,
        "Please view this email in HTML",
        htmlBody,
      );

      reminder.isNotified = true;

      reminder.isActive = false;

      await reminder.save();
    });

    await Promise.all(emailPromises);

    return res.status(200).json({
      success: true,

      message: `Cron executed. Sent ${pendingReminders.length} emails.`,
    });
  } catch (error) {
    console.error("Error in daily email cron:", error);

    return res
      .status(500)
      .json({ error: "Server error during cron execution" });
  }
});

// ==========================
// ROOT ROUTE
// ==========================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",

    message: "Welcome to the CareerFlow API",
  });
});

// ==========================
// EXPORT APP
// ==========================

module.exports = app;
