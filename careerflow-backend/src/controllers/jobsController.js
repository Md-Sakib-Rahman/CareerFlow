const Job = require("../models/Job");
const Board = require("../models/Board");
const Reminder = require("../models/Reminder"); // NEW: Import the standalone model
const User = require("../models/User");
const Resume = require("../models/Resume");
const { getPlanLimits } = require("../utils/planLimits");

const isValidLeadDays = (v) => v === undefined || (Number.isInteger(v) && v >= 0 && v <= 30);

/**
 * @desc    Create a new job (Defaults to Wishlist)
 * @route   POST /api/jobs
 * @access  Private
 */

const createJob = async (req, res) => {
  try {
    const {
      boardId, columnId, company, title,
      salary, url, location, applyDeadlineAt, reminderLeadDays, notes
    } = req.body;
    const userId = req.user._id || req.user.id;

    // ==========================================
    // ⚠️ PAYWALL LOGIC: Enforce Job Limits
    // ==========================================
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const jobLimit = getPlanLimits(user.plan).jobs;
    if (jobLimit !== Infinity) {
      const currentJobCount = await Job.countDocuments({ userId });
      if (currentJobCount >= jobLimit) {
        return res.status(403).json({ 
          success: false, 
          message: "Starter plan limit reached (Max 20 Jobs). Please upgrade to Pro." 
        });
      }
    }
    // ==========================================

    if (!isValidLeadDays(reminderLeadDays)) {
      return res.status(400).json({ success: false, message: "reminderLeadDays must be an integer from 0 to 30" });
    }

    // 1. VALIDATION
    const board = await Board.findOne({ _id: boardId, userId });
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });

    const targetColumn = board.columns.id(columnId);
    if (!targetColumn) return res.status(400).json({ success: false, message: "Invalid Column ID" });

    if (targetColumn.internalStatus !== "wishlist") {
      return res.status(400).json({
        success: false,
        message: `Logic Error: New jobs must start in a 'wishlist' column, not '${targetColumn.internalStatus}'.`
      });
    }

    // ... The rest of your job creation logic stays exactly the same ...
    
    // 2. Prepare Job Data 
    const jobData = {
      userId, boardId, columnId, company, title,
      status: "wishlist", salary, url, location, notes,
      dates: { wishlistAt: new Date() }
    };

    let reminderConfig = null;
    if (applyDeadlineAt) {
      const targetDate = new Date(applyDeadlineAt);
      const lead = reminderLeadDays ?? 2;
      const rDate = new Date(targetDate);
      rDate.setDate(rDate.getDate() - lead);

      jobData.dates.applyDeadlineAt = targetDate;
      reminderConfig = { targetDate, rDate, lead };
    }

    const newJob = await Job.create(jobData);

    if (reminderConfig) {
      await Reminder.create({
        userId,
        jobId: newJob._id,
        type: "apply",
        reminderDate: reminderConfig.rDate,
        targetDate: reminderConfig.targetDate,
        leadDays: reminderConfig.lead
      });
    }

    res.status(201).json({ success: true, message: "Job added to Wishlist", data: newJob });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create job", error: error.message });
  }
};
/**
 * @desc    Get all jobs for a specific board
 * @route   GET /api/jobs/board/:boardId
 * @access  Private
 */
const getBoardJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ boardId: req.params.boardId, userId: req.user.id })
                          .populate("reminders"); // Fetches from the separate collection via Virtuals

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update job details or move column
 * @route   PATCH /api/jobs/:id
 * @access  Private
 */


const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const { status, columnId, dates, reminderLeadDays, ...metadata } = req.body;

    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    if (!isValidLeadDays(reminderLeadDays)) {
      return res.status(400).json({ success: false, message: "reminderLeadDays must be an integer from 0 to 30" });
    }
    if (dates !== undefined && (dates === null || typeof dates !== "object" || Array.isArray(dates))) {
      return res.status(400).json({ success: false, message: "dates must be an object" });
    }
    for (const key of ["applyDeadlineAt", "actualInterviewDate"]) {
      if (dates && dates[key] !== undefined && Number.isNaN(new Date(dates[key]).getTime())) {
        return res.status(400).json({ success: false, message: `Invalid date for ${key}` });
      }
    }

    // 1. GUARDRAIL: column must belong to the job's board and agree with status
    let nextStatus = status;
    if (columnId) {
      const board = await Board.findById(job.boardId);
      const targetColumn = board.columns.id(columnId);
      if (!targetColumn) {
        return res.status(400).json({ success: false, message: "Invalid Column ID for this board." });
      }
      if (status && targetColumn.internalStatus !== status) {
        return res.status(400).json({
          success: false,
          message: `Mismatch: Target column does not match status ${status}.`
        });
      }
      nextStatus = targetColumn.internalStatus;
    } else if (status && status !== job.status) {
      return res.status(400).json({
        success: false,
        message: "columnId is required when changing status."
      });
    }

    // 2. METADATA UPDATE
    if (metadata.company) job.company = metadata.company;
    if (metadata.title) job.title = metadata.title;
    if (metadata.location !== undefined) job.location = metadata.location;
    if (metadata.url !== undefined) job.url = metadata.url;
    if (metadata.notes !== undefined) job.notes = metadata.notes;

    if (metadata.salary) {
      job.salary.min = metadata.salary.min ?? job.salary.min;
      job.salary.max = metadata.salary.max ?? job.salary.max;
      job.salary.currency = metadata.salary.currency ?? job.salary.currency;
    }

    // 3. FUNNEL ANALYTICS & GHOST REMINDER CLEANUP
    const isStatusChange = nextStatus && nextStatus !== job.status;
    const isColumnChange = columnId && columnId !== job.columnId?.toString();

    if (isStatusChange || isColumnChange) {
      const targetStatus = nextStatus || job.status;

      // ==========================================
      // GHOST CLEANUP LOGIC (Simplified & 100% Accurate)
      // ==========================================
      // If the job changes stages, instantly nuke ALL existing reminders.
      // This prevents "fired" notifications from haunting the new stage.
      await Reminder.deleteMany({ jobId: job._id });
      
      // Wipe contextual dates so old deadlines don't linger
      job.dates.actualInterviewDate = undefined;
      job.dates.applyDeadlineAt = undefined;

      if (job.status === "rejected" && targetStatus !== "rejected") job.dates.rejectedAt = undefined;

      // FUNNEL FLAGS & DATE LOGIC 
      if (targetStatus === "wishlist") {
        job.isApplied = job.isInterviewing = job.isOffered = job.isRejected = false;
        job.dates.appliedAt = job.dates.interviewingAt = job.dates.offerAt = job.dates.rejectedAt = undefined;
      } else if (targetStatus === "applied") {
        job.isApplied = true;
        job.isInterviewing = job.isOffered = job.isRejected = false;
        job.dates.appliedAt = job.dates.appliedAt || new Date();
        job.dates.interviewingAt = job.dates.offerAt = job.dates.rejectedAt = undefined;
      } else if (targetStatus === "interviewing") {
        job.isApplied = job.isInterviewing = true;
        job.isOffered = job.isRejected = false;
        job.dates.interviewingAt = job.dates.interviewingAt || new Date();
        job.dates.offerAt = job.dates.rejectedAt = undefined;
      } else if (targetStatus === "offer") {
        job.isApplied = job.isInterviewing = job.isOffered = true;
        job.isRejected = false;
        job.dates.offerAt = job.dates.offerAt || new Date();
      } else if (targetStatus === "rejected") {
        job.isRejected = true;
        job.dates.rejectedAt = job.dates.rejectedAt || new Date();
      }
      
      job.status = targetStatus;
      if (columnId) job.columnId = columnId;
    }

    // 4. DATE MERGE & CONTEXTUAL REMINDERS
    if (dates) {
      // Because we cleared actualInterviewDate and applyDeadlineAt above, 
      // this will safely write the *new* ones if the payload includes them.
      const isWishlist = job.status === "wishlist";
      const applyDate = dates.applyDeadlineAt ?? (isWishlist ? dates.actualInterviewDate : undefined);
      const interviewDate = isWishlist ? undefined : dates.actualInterviewDate;
      if (applyDate !== undefined) job.dates.applyDeadlineAt = applyDate;
      if (interviewDate !== undefined) job.dates.actualInterviewDate = interviewDate;

      let reminderType = null;
      // ONLY set "apply" if currently in wishlist
      if (job.status === "wishlist") reminderType = "apply";
      // ONLY set "interview" if currently in applied/interviewing
      else if (["applied", "interviewing"].includes(job.status)) reminderType = "interview";

      if (reminderType && (interviewDate || applyDate)) {
        const targetDate = new Date(interviewDate || applyDate);
        const lead = reminderLeadDays ?? 2;
        const rDate = new Date(targetDate);
        rDate.setDate(rDate.getDate() - lead);

        await Reminder.findOneAndUpdate(
          { jobId: job._id, type: reminderType },
          { userId, reminderDate: rDate, targetDate, leadDays: lead, isActive: true },
          { upsert: true, returnDocument: "after" }
        );
      }
    }

    const updatedJob = await job.save();
    
    // Populate reminders so the frontend Redux store gets the fresh, clean array
    const finalJob = await Job.findById(updatedJob._id).populate("reminders");

    res.status(200).json({ success: true, data: finalJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @desc    Delete a specific job card
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    // 1. Find and delete the job
    const job = await Job.findOneAndDelete({ _id: jobId, userId });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // 2. CASCADE DELETE: Wipe out any reminders attached to this deleted job
    await Reminder.deleteMany({ jobId: jobId });
    await Resume.updateMany({ jobId: jobId }, { jobId: null });

    res.status(200).json({
      success: true,
      message: "Job removed from board successfully",
      data: { id: jobId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get ALL jobs for the authenticated user across all boards
 * @route   GET /api/jobs
 * @access  Private
 */
const getAllUserJobs = async (req, res) => {
  try {
    // Notice we only filter by userId, ignoring boardId
    const jobs = await Job.find({ userId: req.user.id })
                          .populate("reminders"); 

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createJob, getBoardJobs, updateJob, deleteJob, getAllUserJobs };