const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    default: "General",
  },

  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    default: null,
  },

  fileUrl: {
    type: String,
    required: true,
  },

  cloudinaryId: {
    type: String,
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", resumeSchema);
