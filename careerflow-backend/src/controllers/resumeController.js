const Resume = require("../models/Resume");
const User = require("../models/User"); // ⚠️ REQUIRED: Imported User model to check plans
const cloudinary = require("../config/cloudinary");

// Upload resume
exports.uploadResume = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // ==========================================
    // ⚠️ PAYWALL LOGIC: Enforce Resume Limits
    // ==========================================
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Block Starter Plan entirely
    if (user.plan === 'starter') {
      return res.status(403).json({ 
        message: "Starter plan does not include Resume Vault access. Please upgrade to Pro." 
      });
    }

    // Check current storage count
    const currentResumeCount = await Resume.countDocuments({ userId });

    // Enforce Pro Plan limit (30)
    if (user.plan === 'pro' && currentResumeCount >= 30) {
      return res.status(403).json({ 
        message: "Pro plan limit reached (Max 30 Resumes). Please upgrade to Elite." 
      });
    }

    // Enforce Executive Plan limit (100)
    if (user.plan === 'executive' && currentResumeCount >= 100) {
      return res.status(403).json({ 
        message: "Executive plan limit reached (Max 100 Resumes)." 
      });
    }
    // ==========================================

    if (!req.files || !req.files.resume) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.resume;

    // Upload PDF to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
      folder: "resumes",
    });

    const newResume = await Resume.create({
      name: file.name,
      type: req.body.type || "General",
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      userId: userId,
    });

    res.status(201).json(newResume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// Get all resumes
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    
    if (resume.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this resume" });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(resume.cloudinaryId, {
      resource_type: "auto",
    });

    await resume.deleteOne();

    res.status(200).json({ message: "Resume deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
