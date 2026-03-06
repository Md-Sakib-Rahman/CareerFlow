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
const Reminder = require('./models/Reminder');  
const { sendNotificationEmail } = require('./utils/email'); 
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
app.get('/api/cron/send-daily-emails', async (req, res) => {
  // 1. Verify Vercel authorization
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();

    // 2. Find all active, unsent reminders due right now or earlier
    const pendingReminders = await Reminder.find({
      isActive: true,
      isNotified: false,
      reminderDate: { $lte: now }
    })
    .populate('userId', 'name email') // Fetch the user's name and email
    .populate('jobId', 'title company'); // Fetch the job details (adjust field names to match your Job schema)

    if (pendingReminders.length === 0) {
      return res.status(200).json({ success: true, message: 'No pending reminders found.' });
    }

    // 3. Process each reminder
    // Using Promise.all to handle multiple emails concurrently for better performance
    const emailPromises = pendingReminders.map(async (reminder) => {
      // Safety check in case a user or job was deleted but the reminder remained
      if (!reminder.userId || !reminder.jobId) return; 

      const { email, name } = reminder.userId;
      const { title, company } = reminder.jobId;
      
      // Determine email content based on reminder type
      let subject = '';
      // let text = '';
      const formattedTargetDate = new Date(reminder.targetDate).toLocaleDateString();

      // switch (reminder.type) {
      //   case 'interview':
      //     subject = `Upcoming Interview: ${title} at ${companyName}`;
      //     text = `Hi ${name},\n\nThis is a reminder for your upcoming interview for the ${title} position at ${companyName} on ${formattedTargetDate}.\n\nGood luck!`;
      //     break;
      //   case 'apply':
      //     subject = `Application Deadline Approaching: ${title}`;
      //     text = `Hi ${name},\n\nDon't forget to submit your application for ${title} at ${companyName} by ${formattedTargetDate}.`;
      //     break;
      //   case 'follow-up':
      //     subject = `Time to Follow Up: ${title} at ${companyName}`;
      //     text = `Hi ${name},\n\nIt's time to follow up on your application for the ${title} role at ${companyName}.`;
      //     break;
      // }
      switch (reminder.type) {
        case 'interview': subject = `Upcoming Interview: ${title} at ${company}`; break;
        case 'apply':     subject = `Application Deadline Approaching: ${title}`; break;
        case 'follow-up': subject = `Time to Follow Up: ${title} at ${company}`; break;
      }

      const htmlBody = generateEmailHtml(name, title, company, formattedTargetDate, reminder.type);
      // Send the email
      await sendNotificationEmail(email, subject, 'Please view this email in an HTML-compatible client.', htmlBody);

      // Mark this specific reminder as notified and inactive
      reminder.isNotified = true;
      reminder.isActive = false;
      await reminder.save();
    });

    await Promise.all(emailPromises);

    return res.status(200).json({ 
      success: true, 
      message: `Cron executed. Sent ${pendingReminders.length} emails.` 
    });

  } catch (error) {
    console.error('Error in daily email cron:', error);
    return res.status(500).json({ error: 'Server error during cron execution' });
  }
});
const paymentRoutes = require('./routes/paymentRoutes'); // The route for createCheckoutSession
const { generateEmailHtml } = require('./utils/emailTemplates');
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the CareerFlow API'
    });
});

module.exports = app;
