const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Required for linking to User
    ref: 'User',  
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,  
  },
  columns: {
    type: [
      {
        title: {
          type: String,
          required: true,
        },
        internalStatus: {
          type: String, 
          required: true,
          enum: ["wishlist", "applied", "interviewing", "offer", "rejected"],
          default: "wishlist" // 'wishlist' is the starting point
        },
        color: {
          type: String,
          default: "#9333ea" // Defaulting to theme's Primary color : Purple
        }
      },
    ],
    // Initialize with default columns for new users
    default: [
      { title: "Wishlist", internalStatus: "wishlist" },
      { title: "Applied", internalStatus: "applied" },
      { title: "Interviewing", internalStatus: "interviewing" },
      { title: "Offers", internalStatus: "offer" }
    ]
  },
  isPrimary: {
    type: Boolean,
    required: true,
    default: false
  }  
}, {
    timestamps: true  
});

const Board = mongoose.model('Board', boardSchema);
module.exports = Board;