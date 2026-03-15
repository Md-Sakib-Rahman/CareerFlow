const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Readable } = require("stream");
const Resume = require("../models/Resume");
const cloudinary = require("../config/cloudinary");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "resumes" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    Readable.from(file.buffer).pipe(stream);
  });
};

/* Upload Resume */
router.post("/add", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await uploadToCloudinary(req.file);
    const resume = new Resume({
      name: req.file.originalname,
      type: req.body.type || "General",
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      jobId: req.body.jobId === "General" ? null : req.body.jobId,
    });

    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Update Resume (PATCH) - */
router.patch("/:id", upload.single("resume"), async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    if (req.body.type) resume.type = req.body.type;
    if (req.body.jobId) resume.jobId = req.body.jobId === "General" ? null : req.body.jobId;

    if (req.file) {
      await cloudinary.uploader.destroy(resume.cloudinaryId, {
        resource_type: "raw",
      });

      const result = await uploadToCloudinary(req.file);
      resume.fileUrl = result.secure_url;
      resume.cloudinaryId = result.public_id;
      resume.name = req.file.originalname;
    }

    await resume.save();
    const updated = await Resume.findById(resume._id).populate(
      "jobId",
      "title company",
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Get All Resumes */
router.get("/", async (req, res) => {
  try {
    const resumes = await Resume.find()
      .sort({ uploadedAt: -1 })
      .populate("jobId", "title company");
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Delete Resume */
router.delete("/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    await cloudinary.uploader.destroy(resume.cloudinaryId, {
      resource_type: "raw",
    });
    await Resume.findByIdAndDelete(req.params.id);

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;