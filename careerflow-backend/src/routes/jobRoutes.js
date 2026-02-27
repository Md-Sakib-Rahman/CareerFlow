const express = require("express");
const router = express.Router();
const { 
  createJob, 
  getBoardJobs, 
  updateJob, 
  deleteJob 
} = require("../controllers/jobsController");
const { protect } = require("../middleware/authMiddleware");

// All job routes require authentication
router.use(protect);

// Main job creation
router.route("/")
  .post(createJob); // POST /api/jobs - Create a new job (Forces Wishlist + Apply Reminder)

// Fetching jobs for the Kanban board
router.route("/board/:boardId")
  .get(getBoardJobs); // GET /api/jobs/board/:boardId - Fetches jobs and populates Virtual Reminders

// Specific job management (Edit, Move, Delete)
router.route("/:id")
  .patch(updateJob)   // PATCH /api/jobs/:id - Edit details, move columns, upsert reminders
  .delete(deleteJob); // DELETE /api/jobs/:id - Delete job & cascade delete standalone reminders

module.exports = router;