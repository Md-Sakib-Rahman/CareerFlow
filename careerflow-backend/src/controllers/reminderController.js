const Reminder = require("../models/Reminder");

/**
 * @desc    Get all active, due notifications for the logged-in user
 * @route   GET /api/reminders/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res) => {
  try {
    const today = new Date();

    // 1. Find reminders that are active and whose date has arrived/passed
    const notifications = await Reminder.find({
      userId: req.user.id,
      isActive: true,
      reminderDate: { $lte: today } // $lte means "Less than or equal to" today
    })
    // 2. Populate the Job details so the UI can say: "Apply to [Google] for [Frontend Engineer]"
    .populate("jobId", "company title status"); 

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch notifications", 
      error: error.message 
    });
  }
};
/**
 * @desc    Dismiss a notification (Marks it as inactive/read)
 * @route   PATCH /api/reminders/:id/dismiss
 * @access  Private
 */
const dismissReminder = async (req, res) => {
  try {
    const reminderId = req.params.id;
    const userId = req.user.id;

    // 1. Find the reminder and ensure it belongs to the authenticated user
    const reminder = await Reminder.findOne({ _id: reminderId, userId });

    if (!reminder) {
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found or unauthorized" 
      });
    }

    // 2. Deactivate it so it no longer appears in the Bell Icon or triggers the Cron Job
    reminder.isActive = false;
    await reminder.save();

    res.status(200).json({
      success: true,
      message: "Notification dismissed successfully",
      // Returning the ID allows the React frontend to easily filter it out of the state array
      data: { id: reminderId }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to dismiss notification", 
      error: error.message 
    });
  }
};

module.exports = {
  getMyNotifications,
  dismissReminder
};