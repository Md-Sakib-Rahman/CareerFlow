const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  columns: {
    type: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        internalStatus: {
          type: String, 
          required: true,
          // Added 'archived' to handle rejected/hidden jobs without breaking the 4-stage flow
          enum: ["wishlist", "applied", "interviewing", "offer", "rejected", "archived"],
          default: "wishlist"
        },
        color: {
          type: String,
          default: "#9333ea" 
        },
        // position field ensures columns stay in the correct order after a refresh
        position: {
          type: Number,
          required: true
        }
      },
    ],
    default: [
      { title: "Wishlist", internalStatus: "wishlist", position: 0, color: "#94a3b8" },
      { title: "Applied", internalStatus: "applied", position: 1, color: "#3b82f6" },
      { title: "Interviewing", internalStatus: "interviewing", position: 2, color: "#f59e0b" },
      { title: "Offers", internalStatus: "offer", position: 3, color: "#10b981" }
    ]
  },
  isPrimary: {
    type: Boolean,
    default: false
  }  
}, {
    timestamps: true  
});

const Board = mongoose.model('Board', boardSchema);
module.exports = Board;