const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        required: true
    },
    // The specific column the job belongs to within the board
    columnId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    company: { 
        type: String, 
        trim: true, 
        required: true 
    },
    title: { 
        type: String, 
        trim: true, 
        required: true 
    },
    // Current visual status (e.g., "wishlist", "applied")
    status: {
        type: String,
        enum: ["wishlist", "applied", "interviewing", "offer", "rejected"],
        required: true,
        default: "wishlist"  
    },
    salary: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { 
            type: String, 
            trim: true, 
            uppercase: true,  
            default: "USD"
        }
    },
    url: {
        type: String,
        trim: true,
        default: ""
    },
    
    // ==========================================
    // Analytics & Milestones
    // ==========================================
    isApplied: { type: Boolean, default: false },
    isInterviewing: { type: Boolean, default: false },
    isOffered: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },

    dates: {
        wishlistAt: { type: Date, default: Date.now }, // Initial entry date
        applyDeadlineAt: { type: Date }, // NEW: User's goal for when to apply
        appliedAt: { type: Date },       // When moved to "Applied"
        interviewingAt: { type: Date },  // When moved to "Interviewing"
        actualInterviewDate: { type: Date }, // NEW: Scheduled meeting time
        offerAt: { type: Date },
        rejectedAt: { type: Date }
    },

    // ==========================================
    // Proactive Reminders
    // ==========================================
    // Supports custom leads (e.g., 2 days or 3 days) for different events
    reminders: [
        {
            type: { 
                type: String, 
                enum: ["apply", "interview", "follow-up"],
                required: true 
            },
            reminderDate: { type: Date, required: true }, // Calculated based on actualInterviewDate or applyDeadline
            leadDays: { type: Number, default: 2 },
            isNotified: { type: Boolean, default: false },
            isActive: { type: Boolean, default: true }
        }
    ],

    notes: {
        type: String,  
        trim: true,
        default: ""
    }
}, {
    timestamps: true  
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;