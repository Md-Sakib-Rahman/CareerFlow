const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Readable } = require("stream");
const Resume = require("../models/Resume");
const Job = require("../models/Job");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const path = require("path");
const User = require("../models/User");
const { getPlanLimits } = require("../utils/planLimits");
const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};
const FILE_TYPE_MESSAGE = "Only PDF, DOC and DOCX files are allowed";

// An empty or application/octet-stream MIME type is accepted only for an allowed extension.
const fileFilter = (req, file, cb) => {
  const allowed = ALLOWED_TYPES[path.extname(file.originalname || "").toLowerCase()];
  if (allowed && (!file.mimetype || file.mimetype === "application/octet-stream" || allowed.includes(file.mimetype))) return cb(null, true);
  const err = new Error(FILE_TYPE_MESSAGE);
  err.code = "INVALID_FILE_TYPE";
  cb(err);
};

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter });

// Turns multer size/type errors into clear 400/413 responses instead of a 500.
const uploadResume = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File too large. Maximum size is 4 MB" });
    }
    if (err.code === "INVALID_FILE_TYPE") return res.status(400).json({ message: FILE_TYPE_MESSAGE });
    return res.status(400).json({ message: "Invalid file upload" });
  });
};

const { protect } = require("../middleware/authMiddleware.js");
const { validateObjectIdParam } = require("../middleware/validateObjectId");

router.param("id", validateObjectIdParam);

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

// jobId must be "General" or a job owned by the user. Returns an error response body or null.
const checkJobId = async (jobId, userId) => {
  if (!jobId || jobId === "General") return null;
  if (!mongoose.isValidObjectId(jobId)) return { status: 400, message: "Invalid jobId" };
  if (!(await Job.exists({ _id: jobId, userId }))) return { status: 404, message: "Job not found" };
  return null;
};

/* Upload Resume */
router.post("/add", protect, uploadResume, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const extractedUserId = req.user?.id || req.user?._id || req.userId;

    if (!extractedUserId) {
        return res.status(400).json({ message: "Could not extract User ID from token. Check your verifyToken middleware." });
    }
    // Plan comes from the database, not the token. Checked before any Cloudinary call.
    const owner = await User.findById(extractedUserId).select("plan");
    const limit = getPlanLimits(owner?.plan).resumes;
    if (limit === 0) {
      return res.status(403).json({ message: "Your plan does not include resume uploads. Upgrade to upload resumes." });
    }
    if ((await Resume.countDocuments({ userId: extractedUserId })) >= limit) {
      return res.status(403).json({ message: `Resume limit reached for your plan (${limit}). Delete a resume or upgrade.` });
    }
    const jobError = await checkJobId(req.body.jobId, extractedUserId);
    if (jobError) return res.status(jobError.status).json({ message: jobError.message });
    const result = await uploadToCloudinary(req.file);
    const resume = new Resume({
      name: req.file.originalname,
      type: req.body.type || "General",
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      jobId: req.body.jobId === "General" ? null : req.body.jobId,
      userId: extractedUserId,
    });

    try {
      await resume.save();
    } catch (saveError) {
      await cloudinary.uploader.destroy(result.public_id, { resource_type: "raw" }).catch(() => {});
      throw saveError;
    }
    res.status(201).json(resume);
  } catch (error) {
    console.error("Resume error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* Update Resume (PATCH) - */
router.patch("/:id", protect, uploadResume, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const jobError = await checkJobId(req.body.jobId, req.user.id);
    if (jobError) return res.status(jobError.status).json({ message: jobError.message });

    if (req.body.type) resume.type = req.body.type;
    if (req.body.jobId) resume.jobId = req.body.jobId === "General" ? null : req.body.jobId;

    let oldCloudinaryId = null;
    let newCloudinaryId = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      newCloudinaryId = result.public_id;
      oldCloudinaryId = resume.cloudinaryId;
      resume.fileUrl = result.secure_url;
      resume.cloudinaryId = result.public_id;
      resume.name = req.file.originalname;
    }

    try {
      await resume.save();
    } catch (saveError) {
      if (newCloudinaryId) {
        await cloudinary.uploader.destroy(newCloudinaryId, { resource_type: "raw" }).catch(() => {});
      }
      throw saveError;
    }
    if (oldCloudinaryId) {
      await cloudinary.uploader.destroy(oldCloudinaryId, { resource_type: "raw" }).catch(() => {});
    }
    const updated = await Resume.findById(resume._id).populate(
      "jobId",
      "title company",
    );
    res.json(updated);
  } catch (error) {
    console.error("Resume error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* Get All Resumes */
router.get("/", protect,  async (req, res) => {
  try {
    const extractedUserId = req.user?.id || req.user?._id || req.userId;
    if (!extractedUserId) {
      return res.status(401).json({ message: "Unauthorized request" });
    }
    const resumes = await Resume.find({ userId: extractedUserId })
      .sort({ uploadedAt: -1 })
      .populate("jobId", "title company");
    res.json(resumes);
  } catch (error) {
    console.error("Resume error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/* Delete Resume */
router.delete("/:id", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    await cloudinary.uploader.destroy(resume.cloudinaryId, {
      resource_type: "raw",
    });
    await Resume.findByIdAndDelete(req.params.id);

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Resume error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;