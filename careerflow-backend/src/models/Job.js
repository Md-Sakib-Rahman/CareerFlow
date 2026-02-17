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
    status: {
        type: String,
        enum: ["wishlist", "applied", "interviewing", "offer", "rejected"],
        required: true,
        default: "wishlist"  
    },
    salary: {
        min: { 
            type: Number, 
            required: true 
        },
        max: { 
            type: Number, 
            required: true 
        },
        currency: { 
            type: String, 
            required: true, 
            trim: true, 
            uppercase: true,  
            default: "USD"
        }
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    appliedAt: {
        type: Date,
        required: true,  
        default: Date.now
    },
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