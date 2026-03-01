const Job = require("../models/Job");

// @desc    Get Analytics Data (Filtered by Board or Global)
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id; // login user id from auth middleware
    const { boardId } = req.query; // frontend data for filtering (optional, default to "all")

    // ১. filtering logic
    // if boardId is provided and not "all", filter by that board. Otherwise, show data for all boards of the user.
    // new user-friendly filter: if boardId is "all" or not provided, we ignore the board filter and show all data for the user.
    let filter = { user: userId };
    if (boardId && boardId !== "all") {
      filter.board = boardId;
    }

    // ২. Job Pipeline Status: filtered data aggregation with dynamic filter
    const pipelineStats = await Job.aggregate([
      { $match: filter }, 
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statsMap = {
      wishlist: 0,
      applied: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0,
    };

    pipelineStats.forEach((stat) => {
      if (statsMap.hasOwnProperty(stat._id)) {
        statsMap[stat._id] = stat.count;
      }
    });

    // ৩. Success Rate calculation: (interviewing / total applications) * 100
    const totalApps = statsMap.applied + statsMap.interviewing + statsMap.offered + statsMap.rejected;
    const successRate = totalApps > 0 
      ? ((statsMap.interviewing / totalApps) * 100).toFixed(2) 
      : 0;

    // ৪. Monthly Activity: last 30 days data (status: applied)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyActivity = await Job.aggregate([
      {
        $match: {
          ...filter, // dynamic filter (All boards or specific board)
          createdAt: { $gte: thirtyDaysAgo },
          status: "applied",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      selectedBoard: boardId || "all",
      data: {
        pipelineStatus: statsMap,
        successRate: `${successRate}%`,
        totalJobFunnel: {
          totalSaved: statsMap.wishlist + totalApps,
          totalApplied: totalApps,
          totalInterviews: statsMap.interviewing,
        },
        monthlyActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };