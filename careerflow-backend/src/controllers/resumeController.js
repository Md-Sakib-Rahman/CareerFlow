const Resume = require("../models/Resume");
const cloudinary = require("../config/cloudinary");
const Job = require("../models/Job");

// Upload Resume
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

    const newResumeData = {
      name: file.name,
      type: req.body.type || "General",
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
    };

    if (req.body.jobId) {
      newResumeData.jobId = req.body.jobId;
    }

    const newResume = await Resume.create(newResumeData);

    await newResume.populate({ path: "jobId", select: "title company _id" });
    
    res.status(201).json(newResume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// Get all resumes
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find()
      .sort({ uploadedAt: -1 })
      .populate({ path: "jobId", select: "title company _id" });

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

// Update Resume (Edit)
exports.updateResume = async (req, res) => {
  try {
    const { name, type, jobId } = req.body;
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // Update fields if provided
    if (name) resume.name = name;
    if (type) resume.type = type;
    if (jobId) resume.jobId = jobId;

    // If a new file is uploaded, replace old file
    if (req.files && req.files.resume) {
      // Delete old file from Cloudinary
      await cloudinary.uploader.destroy(resume.cloudinaryId, {
        resource_type: "auto",
      });

      // Upload new file
      const file = req.files.resume;
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        resource_type: "auto",
        folder: "resumes",
      });

      resume.fileUrl = result.secure_url;
      resume.cloudinaryId = result.public_id;
    }
    await resume.save();

    // Populate job info
    await resume.populate({ path: "jobId", select: "title company _id" });
    res.status(200).json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};