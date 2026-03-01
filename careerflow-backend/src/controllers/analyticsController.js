const Job = require("../models/Job");

// @desc    Get Analytics Data
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user is set by auth middleware and contains the user's ID

    // ১. Job Pipeline Status: every status count for the user
    const pipelineStats = await Job.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // default value
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

    // ২. Success Rate calculation: (Interviews / Applications) * 100
    const totalApps = statsMap.applied + statsMap.interviewing + statsMap.offered + statsMap.rejected;
    const successRate = totalApps > 0 
      ? ((statsMap.interviewing / totalApps) * 100).toFixed(2) 
      : 0;

    // ৩. Monthly Activity: last 30 days everyday applied jobs count
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyActivity = await Job.aggregate([
      {
        $match: {
          user: userId,
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
      data: {
        pipelineStatus: statsMap, // kanvan status data
        successRate: `${successRate}%`, // success rate
        totalJobFunnel: {
          totalSaved: statsMap.wishlist + totalApps,
          totalApplied: totalApps,
          totalInterviews: statsMap.interviewing,
        },
        monthlyActivity, // graph data for last 30 days
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };