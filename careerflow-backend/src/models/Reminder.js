const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true // Speeds up queries when fetching "My Agenda" on the frontend
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    type: {
        type: String,
        enum: ["apply", "interview", "follow-up"],
        required: true
    },
    // The exact date the email/notification should be sent
    reminderDate: {
        type: Date,
        required: true,
        index: true // CRITICAL: Makes the Cron Job search extremely fast
    },
    // The actual event date (e.g., the interview time or the application deadline)
    // Useful for email templates: "Your interview is on [targetDate]"
    targetDate: {
        type: Date,
        required: true
    },
    leadDays: {
        type: Number,
        default: 2
    },
    isNotified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound Index: We will frequently search for a specific reminder type for a specific job 
// (e.g., "Find the 'interview' reminder for Job ID 123 to deactivate it").
// This compound index makes those lookups instant.
reminderSchema.index({ jobId: 1, type: 1 });

const Reminder = mongoose.model("Reminder", reminderSchema);
module.exports = Reminder;