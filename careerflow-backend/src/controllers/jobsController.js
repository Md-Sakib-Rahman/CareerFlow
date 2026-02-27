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
//     const { status, columnId, dates, reminderLeadDays, ...otherUpdates } = req.body;

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

//     // 2. PROACTIVE CLEANUP & FUNNEL ANALYTICS
//     const isStatusChange = status && status !== job.status;
//     const isColumnChange = columnId && columnId !== job.columnId?.toString();

//     if (isStatusChange || isColumnChange) {
//       const targetStatus = status || job.status;

//       // Delete obsolete standalone reminders
//       if (targetStatus === "applied") {
//         await Reminder.deleteMany({ jobId: job._id, type: "apply" });
//       } 
//       else if (targetStatus === "interviewing") {
//         await Reminder.deleteMany({ jobId: job._id, type: { $in: ["apply", "interview"] } });
//       } 
//       else if (["offer", "rejected"].includes(targetStatus)) {
//         await Reminder.deleteMany({ jobId: job._id });
//       }

//       // ==========================================
//       // Analytics & Milestone Funnel Logic
//       // ==========================================
//       // If moving backwards, we wipe downstream flags AND dates to keep data clean
      
//       if (targetStatus === "wishlist") {
//         job.isApplied = false; 
//         job.isInterviewing = false; 
//         job.isOffered = false; 
//         job.isRejected = false;
//         // Clear dates
//         job.dates.appliedAt = undefined;
//         job.dates.interviewingAt = undefined;
//         job.dates.offerAt = undefined;
//         job.dates.rejectedAt = undefined;
//       } 
//       else if (targetStatus === "applied") {
//         job.isApplied = true; 
//         job.dates.appliedAt = job.dates.appliedAt || new Date();
//         // Reset downstream
//         job.isInterviewing = false; 
//         job.isOffered = false; 
//         job.isRejected = false;
//         job.dates.interviewingAt = undefined;
//         job.dates.offerAt = undefined;
//         job.dates.rejectedAt = undefined;
//       } 
//       else if (targetStatus === "interviewing") {
//         job.isApplied = true; 
//         job.dates.appliedAt = job.dates.appliedAt || new Date();
//         job.isInterviewing = true; 
//         job.dates.interviewingAt = job.dates.interviewingAt || new Date();
//         // Reset downstream
//         job.isOffered = false; 
//         job.isRejected = false;
//         job.dates.offerAt = undefined;
//         job.dates.rejectedAt = undefined;
//       } 
//       else if (targetStatus === "offer") {
//         job.isApplied = true; 
//         job.isInterviewing = true; 
//         job.isOffered = true;
//         job.dates.offerAt = job.dates.offerAt || new Date();
//         job.isRejected = false;
//         job.dates.rejectedAt = undefined;
//       } 
//       else if (targetStatus === "rejected") {
//         job.isRejected = true;
//         job.dates.rejectedAt = job.dates.rejectedAt || new Date();
//         // Note: We usually keep previous dates for 'rejected' status 
//         // to analyze how far the candidate got before the rejection.
//       }
      
//       job.status = targetStatus;
//     }

//     // Safely merge dates
//     if (dates) {
//       for (const key in dates) {
//         job.dates[key] = dates[key];
//       }
//     }

//     // 3. PROACTIVE REMINDERS (Upsert Logic)
//     if (dates && dates.actualInterviewDate) {
//       if (job.status !== "applied" && job.status !== "interviewing") {
//          return res.status(400).json({ 
//            success: false, 
//            message: "Can only schedule interviews while in 'Applied' or 'Interviewing' status." 
//          });
//       }

//       const targetDate = new Date(dates.actualInterviewDate);
//       const lead = reminderLeadDays || 2;
//       const rDate = new Date(targetDate);
//       rDate.setDate(rDate.getDate() - lead);

//       // Upsert: Updates the existing interview reminder or creates a new one
//       await Reminder.findOneAndUpdate(
//         { jobId: job._id, type: "interview" },
//         {
//           userId,
//           reminderDate: rDate,
//           targetDate: targetDate,
//           leadDays: lead,
//           isActive: true
//         },
//         { upsert: true, new: true }
//       );

//       job.dates.actualInterviewDate = targetDate; 
//     }

//     // 4. Final Save
//     if (columnId) job.columnId = columnId;
//     Object.assign(job, otherUpdates);

//     const updatedJob = await job.save();

//     // Re-fetch the job so the populated virtuals are returned in the response
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
    
    // Destructure specifically to separate logic fields from metadata fields
    const { status, columnId, dates, reminderLeadDays, ...metadata } = req.body;

    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    // 1. GUARDRAIL
    if (columnId && status) {
      const board = await Board.findById(job.boardId);
      const targetColumn = board.columns.id(columnId);
      if (targetColumn.internalStatus !== status) {
        return res.status(400).json({
          success: false,
          message: `Mismatch: Column '${targetColumn.title}' is for ${targetColumn.internalStatus}, not ${status}.`
        });
      }
    }

    // 2. METADATA UPDATE (Explicit mapping for nested objects)
    if (metadata.company) job.company = metadata.company;
    if (metadata.title) job.title = metadata.title;
    if (metadata.location) job.location = metadata.location;
    if (metadata.url) job.url = metadata.url;
    if (metadata.notes) job.notes = metadata.notes;

    // Handle nested salary object explicitly to prevent overwriting the whole object
    if (metadata.salary) {
      job.salary.min = metadata.salary.min ?? job.salary.min;
      job.salary.max = metadata.salary.max ?? job.salary.max;
      job.salary.currency = metadata.salary.currency ?? job.salary.currency;
    }

    // 3. PROACTIVE CLEANUP & FUNNEL ANALYTICS
    const isStatusChange = status && status !== job.status;
    const isColumnChange = columnId && columnId !== job.columnId?.toString();

    if (isStatusChange || isColumnChange) {
      const targetStatus = status || job.status;

      // Delete obsolete standalone reminders
      if (targetStatus === "applied") {
        await Reminder.deleteMany({ jobId: job._id, type: "apply" });
      } else if (targetStatus === "interviewing") {
        await Reminder.deleteMany({ jobId: job._id, type: { $in: ["apply", "interview"] } });
      } else if (["offer", "rejected"].includes(targetStatus)) {
        await Reminder.deleteMany({ jobId: job._id });
      }

      // Funnel Logic
      if (targetStatus === "wishlist") {
        job.isApplied = job.isInterviewing = job.isOffered = job.isRejected = false;
        job.dates.appliedAt = job.dates.interviewingAt = job.dates.offerAt = job.dates.rejectedAt = undefined;
      } else if (targetStatus === "applied") {
        job.isApplied = true;
        job.isInterviewing = job.isOffered = job.isRejected = false;
        job.dates.appliedAt = job.dates.appliedAt || new Date();
      } else if (targetStatus === "interviewing") {
        job.isApplied = job.isInterviewing = true;
        job.isOffered = job.isRejected = false;
        job.dates.interviewingAt = job.dates.interviewingAt || new Date();
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

    // 4. DATE MERGE & REMINDERS
    if (dates) {
      for (const key in dates) {
        job.dates[key] = dates[key];
      }

      if (dates.actualInterviewDate) {
        const targetDate = new Date(dates.actualInterviewDate);
        const lead = reminderLeadDays || 2;
        const rDate = new Date(targetDate);
        rDate.setDate(rDate.getDate() - lead);

        await Reminder.findOneAndUpdate(
          { jobId: job._id, type: "interview" },
          { userId, reminderDate: rDate, targetDate, leadDays: lead, isActive: true },
          { upsert: true, new: true }
        );
        job.dates.actualInterviewDate = targetDate; 
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