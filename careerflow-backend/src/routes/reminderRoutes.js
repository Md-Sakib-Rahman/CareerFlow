const express = require("express");
const router = express.Router();
const { getMyNotifications , dismissReminder} = require("../controllers/reminderController");
const { protect } = require("../middleware/authMiddleware");
const { requirePro } = require("../middleware/paywallMiddleware");
const { validateObjectIdParam } = require("../middleware/validateObjectId");
// All reminder routes require authentication
router.use(protect);
router.use(requirePro);
router.param("id", validateObjectIdParam);
// Fetch active notifications for the Bell Icon
router.route("/notifications")
  .get(getMyNotifications); // GET /api/reminders/notifications
// Dismiss a specific notification
router.route("/:id/dismiss")
  .patch(dismissReminder); // PATCH /api/reminders/:id/dismiss
  
module.exports = router;