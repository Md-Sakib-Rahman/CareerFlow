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
    location: { type: String, default: "" },
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
        wishlistAt: { type: Date, default: Date.now }, 
        applyDeadlineAt: { type: Date }, 
        appliedAt: { type: Date },       
        interviewingAt: { type: Date },  
        actualInterviewDate: { type: Date }, 
        offerAt: { type: Date },
        rejectedAt: { type: Date }
    },

    notes: {
        type: String,  
        trim: true,
        default: ""
    }
}, {
    timestamps: true  
});

// ==========================================
// Virtuals (Linking the separate Reminder collection)
// ==========================================
// This allows us to populate the jobs with their reminders
// without actually storing the reminders inside this document.
jobSchema.virtual('reminders', {
    ref: 'Reminder',         // The model to use
    localField: '_id',       // Find reminders where `localField`
    foreignField: 'jobId',   // is equal to `foreignField`
    justOne: false
});

// Ensure virtual fields are serialized when sending JSON to the frontend
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;