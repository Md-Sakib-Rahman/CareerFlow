const Job = require("../models/Job");
const Board = require("../models/Board");
const mongoose = require("mongoose");

const getAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { boardId } = req.query;

    // 1. Concurrent Fetch: Get Board List while preparing Aggregation
    const boardsListTask = Board.find({ userId }).select("name _id").lean();

    // 2. Base Filter
    const matchStage = { userId };
    if (boardId && boardId !== "all") {
      matchStage.boardId = new mongoose.Types.ObjectId(boardId);
    }

    // 3. Single-Pass Aggregation (The "Pro" Way)
    const [analyticsResult] = await Job.aggregate([
      { $match: matchStage },
      {
        $facet: {
          // Part A: Status Pipeline
          pipelineStats: [
            { $group: { _id: { $toLower: "$status" }, count: { $sum: 1 } } }
          ],
          // Part B: Monthly Activity (Optimized)
          monthlyActivity: [
            {
              $match: {
                "dates.appliedAt": { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$dates.appliedAt" } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          // Part C: Response Time Logic (Avg days from Applied to Interview)
          avgResponseTime: [
            { 
              $match: { 
                "dates.appliedAt": { $exists: true }, 
                "dates.interviewAt": { $exists: true } 
              } 
            },
            {
              $project: {
                daysToResponse: {
                  $divide: [
                    { $subtract: ["$dates.interviewAt", "$dates.appliedAt"] },
                    1000 * 60 * 60 * 24
                  ]
                }
              }
            },
            { $group: { _id: null, avgDays: { $avg: "$daysToResponse" } } }
          ]
        }
      }
    ]);

    const boardsList = await boardsListTask;

    // 4. Data Normalization (Cleaning up the Map)
    const stats = { wishlist: 0, applied: 0, interviewing: 0, offered: 0, rejected: 0 };
    analyticsResult.pipelineStats.forEach(item => {
      const key = item._id === 'offer' ? 'offered' : item._id;
      if (stats.hasOwnProperty(key)) stats[key] = item.count;
    });

    // 5. Advanced Metrics (The "Insight" Layer)
    const totalApps = stats.applied + stats.interviewing + stats.offered + stats.rejected;
    const interviewRate = totalApps > 0 ? ((stats.interviewing / totalApps) * 100).toFixed(1) : 0;
    const offerRate = stats.interviewing > 0 ? ((stats.offered / stats.interviewing) * 100).toFixed(1) : 0;
    
    // Pro Detail: Ghosting Detection (Applied > 14 days ago with no status change)
    const ghostedCount = await Job.countDocuments({
      ...matchStage,
      status: 'applied',
      "dates.appliedAt": { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      data: {
        boards: boardsList,
        pipelineStatus: stats,
        metrics: {
          successRate: totalApps > 0 ? ((stats.offered / totalApps) * 100).toFixed(1) : 0,
          interviewRate: `${interviewRate}%`, // How good is the resume?
          offerRate: `${offerRate}%`,         // How good is the interviewing?
          avgResponseDays: Math.round(analyticsResult.avgResponseTime[0]?.avgDays || 0),
          ghostedApplications: ghostedCount
        },
        funnel: [
          { step: "Applied", count: totalApps },
          { step: "Interviewed", count: stats.interviewing },
          { step: "Offered", count: stats.offered }
        ],
        monthlyActivity: analyticsResult.monthlyActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
module.exports = { getAnalytics };
