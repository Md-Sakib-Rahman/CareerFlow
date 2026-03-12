const Resume = require("../models/Resume");
const cloudinary = require("../config/cloudinary");

// Upload resume
exports.uploadResume = async (req, res) => {
  try {
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
    const resumes = await Resume.find().sort({ createdAt: -1 });
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
