const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Readable } = require("stream");

const Resume = require("../models/Resume");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* Upload Resume */

router.post("/add", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", folder: "resumes" },
      async (error, result) => {
        if (error) return res.status(500).json({ message: error.message });

        const resume = new Resume({
          name: req.file.originalname,
          type: req.body.type || "General",
          fileUrl: result.secure_url,
          cloudinaryId: result.public_id,
        });

        await resume.save();

        res.status(201).json(resume);
      },
    );

    Readable.from(req.file.buffer).pipe(stream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Get All Resumes */

router.get("/", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ uploadedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Delete Resume */

router.delete("/:id", async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

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
