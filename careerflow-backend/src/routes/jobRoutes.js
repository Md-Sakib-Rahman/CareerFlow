const express = require("express");
const router = express.Router();
const { 
  createJob, 
  getBoardJobs, 
  updateJob, 
  deleteJob,
  getAllUserJobs,

} = require("../controllers/jobsController");
const { protect } = require("../middleware/authMiddleware");
const { validateObjectIdParam } = require("../middleware/validateObjectId");

// All job routes require authentication
router.use(protect);
router.param("id", validateObjectIdParam);
router.param("boardId", validateObjectIdParam);

// Main job creation
// router.route("/")
//   .post(createJob); // POST /api/jobs - Create a new job (Forces Wishlist + Apply Reminder)

// Fetching jobs for the Kanban board
router.route("/board/:boardId")
  .get(getBoardJobs); // GET /api/jobs/board/:boardId - Fetches jobs and populates Virtual Reminders

// Specific job management (Edit, Move, Delete)
router.route("/:id")
  .patch(updateJob)   // PATCH /api/jobs/:id - Edit details, move columns, upsert reminders
  .delete(deleteJob); // DELETE /api/jobs/:id - Delete job & cascade delete standalone reminders


router.route("/").get(getAllUserJobs).post(createJob);


module.exports = router;