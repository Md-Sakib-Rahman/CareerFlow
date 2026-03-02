const Job = require("../models/Job");
const Board = require("../models/Board"); // বোর্ড লিস্টের জন্য প্রয়োজন
const mongoose = require("mongoose");

// @desc    Get Analytics Data (Filtered by Board or Global)
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id; // login user id from auth middleware
    const { boardId } = req.query; // frontend data for filtering

    // ১. ইউজারের সব বোর্ডের লিস্ট আনা (ড্রপডাউনের জন্য)
    const boardsList = await Board.find({ userId }).select("name _id");

    // ২. filtering logic
    // আপনার মডেল অনুযায়ী userId এবং boardId ব্যবহার করা হয়েছে।
    // Aggregate-এ ObjectId ফরম্যাট ছাড়া ডাটা ম্যাচ করে না।
    let filter = { userId: new mongoose.Types.ObjectId(userId) };

    if (boardId && boardId !== "all") {
      filter.boardId = new mongoose.Types.ObjectId(boardId);
    }

    // ৩. Job Pipeline Status: filtered data aggregation
    const pipelineStats = await Job.aggregate([
      { $match: filter }, 
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // কনসোলে চেক করার জন্য
    console.log("Pipeline Stats from DB:", JSON.stringify(pipelineStats, null, 2));

    const statsMap = {
      wishlist: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,      // আপনার মডেল অনুযায়ী 'offer' (একবচন)
      rejected: 0,
    };

    pipelineStats.forEach((stat) => {
      // স্ট্যাটাস কী-গুলো ছোট হাতের করে চেক করা নিরাপদ
      const key = stat._id ? stat._id.toLowerCase() : "";
      if (statsMap.hasOwnProperty(key)) {
        statsMap[key] = stat.count;
      }
    });

    // ৪. Success Rate calculation: (interviewing + offer / total apps) * 100
    const totalApps = statsMap.applied + statsMap.interviewing + statsMap.offer + statsMap.rejected;
    const successCount = statsMap.interviewing + statsMap.offer; 
    const successRate = totalApps > 0 
      ? ((successCount / totalApps) * 100).toFixed(2) 
      : 0;

    // ৫. Monthly Activity: last 30 days data (মডেলের dates.appliedAt ব্যবহার করা হয়েছে)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyActivity = await Job.aggregate([
      {
        $match: {
          ...filter,
          "dates.appliedAt": { $exists: true, $ne: null, $gte: thirtyDaysAgo }
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dates.appliedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      selectedBoard: boardId || "all",
      data: {
        boards: boardsList, // ফ্রন্টএন্ড ড্রপডাউনের জন্য
        pipelineStatus: {
          ...statsMap,
          offered: statsMap.offer // ফ্রন্টএন্ড compatibility-র জন্য offered নাম দেওয়া হলো
        },
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
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };