const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// 1. Import your DB connection
const dbConnect = require('./config/db'); 

const authRoutes= require('./routes/authRoutes');
const boardRoutes= require('./routes/boardRoutes');
const jobRoutes= require('./routes/jobRoutes');
const reminderRoutes = require("./routes/reminderRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { handleStripeWebhook } = require('./controllers/paymentController');
const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? true 
    : ["http://localhost:5173", "http://127.0.0.1:5173","https://career-flow-six.vercel.app"], 
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// GLOBAL MIDDLEWARE
app.use(cors(corsOptions)); 
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
app.use(express.json()); 
app.use(cookieParser());

// 2. CRITICAL FIX: Ensure DB connects before handling any route
app.use(async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// ROUTES
app.use("/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/analytics", analyticsRoutes);

const paymentRoutes = require('./routes/paymentRoutes'); // The route for createCheckoutSession
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the CareerFlow API'
    });
});

module.exports = app;
