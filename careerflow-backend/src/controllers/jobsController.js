const Job = require("../models/Job");
const Board = require("../models/Board");
const Reminder = require("../models/Reminder"); // NEW: Import the standalone model

/**
 * @desc    Create a new job (Defaults to Wishlist)
 * @route   POST /api/jobs
 * @access  Private
 */
const createJob = async (req, res) => {
  try {
    const {
      boardId, columnId, company, title,
      salary, url, applyDeadlineAt, reminderLeadDays, notes
    } = req.body;
    const userId = req.user.id;

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

    // 2. Prepare Job Data (No embedded reminders array!)
    const jobData = {
      userId, boardId, columnId, company, title,
      status: "wishlist", salary, url, notes,
      dates: { wishlistAt: new Date() }
    };

    // 3. Proactive Reminder Setup
    let reminderConfig = null;
    if (applyDeadlineAt) {
      const targetDate = new Date(applyDeadlineAt);
      const lead = reminderLeadDays || 2;
      const rDate = new Date(targetDate);
      rDate.setDate(rDate.getDate() - lead);

      jobData.dates.applyDeadlineAt = targetDate;
      reminderConfig = { targetDate, rDate, lead };
    }

    const newJob = await Job.create(jobData);

    // 4. Create Standalone Reminder if configured
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

// const updateJob = async (req, res) => {
//   try {
//     const jobId = req.params.id;
//     const userId = req.user.id;
    
//     // Destructure specifically to separate logic fields from metadata fields
//     const { status, columnId, dates, reminderLeadDays, ...metadata } = req.body;

//     const job = await Job.findOne({ _id: jobId, userId });
//     if (!job) return res.status(404).json({ success: false, message: "Job not found" });

//     // 1. GUARDRAIL
//     if (columnId && status) {
//       const board = await Board.findById(job.boardId);
//       const targetColumn = board.columns.id(columnId);
//       if (targetColumn.internalStatus !== status) {
//         return res.status(400).json({
//           success: false,
//           message: `Mismatch: Column '${targetColumn.title}' is for ${targetColumn.internalStatus}, not ${status}.`
//         });
//       }
//     }

//     // 2. METADATA UPDATE (Explicit mapping for nested objects)
//     if (metadata.company) job.company = metadata.company;
//     if (metadata.title) job.title = metadata.title;
//     if (metadata.location) job.location = metadata.location;
//     if (metadata.url) job.url = metadata.url;
//     if (metadata.notes) job.notes = metadata.notes;

//     // Handle nested salary object explicitly to prevent overwriting the whole object
//     if (metadata.salary) {
//       job.salary.min = metadata.salary.min ?? job.salary.min;
//       job.salary.max = metadata.salary.max ?? job.salary.max;
//       job.salary.currency = metadata.salary.currency ?? job.salary.currency;
//     }

//     // 3. PROACTIVE CLEANUP & FUNNEL ANALYTICS
//     const isStatusChange = status && status !== job.status;
//     const isColumnChange = columnId && columnId !== job.columnId?.toString();

//     if (isStatusChange || isColumnChange) {
//       const targetStatus = status || job.status;

//       // Delete obsolete standalone reminders
//       if (targetStatus === "applied") {
//         await Reminder.deleteMany({ jobId: job._id, type: "apply" });
//       } else if (targetStatus === "interviewing") {
//         await Reminder.deleteMany({ jobId: job._id, type: { $in: ["apply", "interview"] } });
//       } else if (["offer", "rejected"].includes(targetStatus)) {
//         await Reminder.deleteMany({ jobId: job._id });
//       }

//       // Funnel Logic
//       if (targetStatus === "wishlist") {
//         job.isApplied = job.isInterviewing = job.isOffered = job.isRejected = false;
//         job.dates.appliedAt = job.dates.interviewingAt = job.dates.offerAt = job.dates.rejectedAt = undefined;
//       } else if (targetStatus === "applied") {
//         job.isApplied = true;
//         job.isInterviewing = job.isOffered = job.isRejected = false;
//         job.dates.appliedAt = job.dates.appliedAt || new Date();
//       } else if (targetStatus === "interviewing") {
//         job.isApplied = job.isInterviewing = true;
//         job.isOffered = job.isRejected = false;
//         job.dates.interviewingAt = job.dates.interviewingAt || new Date();
//       } else if (targetStatus === "offer") {
//         job.isApplied = job.isInterviewing = job.isOffered = true;
//         job.isRejected = false;
//         job.dates.offerAt = job.dates.offerAt || new Date();
//       } else if (targetStatus === "rejected") {
//         job.isRejected = true;
//         job.dates.rejectedAt = job.dates.rejectedAt || new Date();
//       }
      
//       job.status = targetStatus;
//       if (columnId) job.columnId = columnId;
//     }

//     // 4. DATE MERGE & REMINDERS
//     if (dates) {
//       for (const key in dates) {
//         job.dates[key] = dates[key];
//       }

//       if (dates.actualInterviewDate) {
//         const targetDate = new Date(dates.actualInterviewDate);
//         const lead = reminderLeadDays || 2;
//         const rDate = new Date(targetDate);
//         rDate.setDate(rDate.getDate() - lead);

//         await Reminder.findOneAndUpdate(
//           { jobId: job._id, type: "interview" },
//           { userId, reminderDate: rDate, targetDate, leadDays: lead, isActive: true },
//           { upsert: true, new: true }
//         );
//         job.dates.actualInterviewDate = targetDate; 
//       }
//     }

//     const updatedJob = await job.save();
//     const finalJob = await Job.findById(updatedJob._id).populate("reminders");

//     res.status(200).json({ success: true, data: finalJob });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const { status, columnId, dates, reminderLeadDays, ...metadata } = req.body;

    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    // 1. GUARDRAIL (Existing)
    if (columnId && status) {
      const board = await Board.findById(job.boardId);
      const targetColumn = board.columns.id(columnId);
      if (!targetColumn || targetColumn.internalStatus !== status) {
        return res.status(400).json({
          success: false,
          message: `Mismatch: Target column does not match status ${status}.`
        });
      }
    }

    // 2. METADATA UPDATE (Existing)
    if (metadata.company) job.company = metadata.company;
    if (metadata.title) job.title = metadata.title;
    if (metadata.location) job.location = metadata.location;
    if (metadata.url) job.url = metadata.url;
    if (metadata.notes) job.notes = metadata.notes;

    if (metadata.salary) {
      job.salary.min = metadata.salary.min ?? job.salary.min;
      job.salary.max = metadata.salary.max ?? job.salary.max;
      job.salary.currency = metadata.salary.currency ?? job.salary.currency;
    }

    // 3. FUNNEL ANALYTICS & GHOST REMINDER CLEANUP
    const isStatusChange = status && status !== job.status;
    const isColumnChange = columnId && columnId !== job.columnId?.toString();

    if (isStatusChange || isColumnChange) {
      const targetStatus = status || job.status;

      // ==========================================
      // GHOST CLEANUP LOGIC
      // ==========================================
      if (isStatusChange) {
        if (targetStatus === "applied") {
          // If you achieved "Applied", delete any "Apply/Deadline" reminders
          await Reminder.deleteMany({ jobId, type: "apply" });
          job.dates.applyDeadlineAt = undefined; // Clear the ghost date
        } 
        else if (targetStatus === "interviewing") {
          // If moved to Interviewing, ensure "Apply" reminders are definitely gone
          await Reminder.deleteMany({ jobId, type: "apply" });
        } 
        else if (["offer", "rejected", "wishlist"].includes(targetStatus)) {
          // Finishing the pipeline or resetting to wishlist wipes ALL reminders
          await Reminder.deleteMany({ jobId });
          // Wipe contextual dates as well
          job.dates.actualInterviewDate = undefined;
          job.dates.applyDeadlineAt = undefined;
        }
      }

      // FUNNEL FLAGS & DATE LOGIC (Existing)
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

    // 4. DATE MERGE & CONTEXTUAL REMINDERS (Updated for Next Stage Only)
    if (dates) {
      for (const key in dates) {
        job.dates[key] = dates[key];
      }

      let reminderType = null;
      // ONLY set "apply" if currently in wishlist
      if (job.status === "wishlist") reminderType = "apply";
      // ONLY set "interview" if currently in applied/interviewing
      else if (["applied", "interviewing"].includes(job.status)) reminderType = "interview";

      if (reminderType && (dates.actualInterviewDate || dates.applyDeadlineAt)) {
        const targetDate = new Date(dates.actualInterviewDate || dates.applyDeadlineAt);
        const lead = reminderLeadDays || 2;
        const rDate = new Date(targetDate);
        rDate.setDate(rDate.getDate() - lead);

        await Reminder.findOneAndUpdate(
          { jobId: job._id, type: reminderType },
          { userId, reminderDate: rDate, targetDate, leadDays: lead, isActive: true },
          { upsert: true, new: true }
        );
      }
    }

    const updatedJob = await job.save();
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

    res.status(200).json({
      success: true,
      message: "Job removed from board successfully",
      data: { id: jobId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createJob, getBoardJobs, updateJob, deleteJob };