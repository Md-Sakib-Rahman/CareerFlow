const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const authRoutes= require('./routes/authRoutes')
const boardRoutes= require('./routes/boardRoutes')
const jobRoutes= require('./routes/jobRoutes')
const reminderRoutes = require("./routes/reminderRoutes");

const corsOptions = {
  // If in development, allow any origin (reflects the request origin).
  // If in production, strictly allow only your deployed frontend URL.
  origin: process.env.NODE_ENV === 'development' 
    ? true 
    : ["http://localhost:5173", "http://127.0.0.1:5173","https://career-flow-six.vercel.app"], 
  
  // CRITICAL: Required to allow cookies (like your refreshToken) to be sent across origins
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
//  GLOBAL MIDDLEWARE
app.use(cors(corsOptions)); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON
app.use(cookieParser());
//  ROUTES
// Replace these with your actual route files for CareerFlow 

// example: app.use("/auth", authRoutes)

app.use("/auth", authRoutes)
app.use("/api/boards", boardRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/reminders", reminderRoutes);
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the CareerFlow API'
    });
});




module.exports = app;