const Job = require("../models/Job");
const Board = require("../models/Board");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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
/**
 * @desc    Generate AI insights based on pipeline health using Gemini
 * @route   GET /api/analytics/ai-insights
 * @access  Private (Pro/Executive Only)
 */
const getAiInsights = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { boardId } = req.query;

    const matchQuery = { userId: userId };
    if (boardId && boardId !== 'all') {
      matchQuery.boardId = boardId;
    }

    // Gather core metrics
    const totalJobs = await Job.countDocuments(matchQuery);

    if (totalJobs === 0) {
      return res.status(200).json({
        success: true,
        data: { aiInsights: "You haven't added any jobs yet! Start adding applications to your board to get personalized AI pipeline insights." }
      });
    }

    const interviewingJobs = await Job.countDocuments({ ...matchQuery, status: 'interviewing' });
    const offeredJobs = await Job.countDocuments({ ...matchQuery, status: 'offer' });
    
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const ghostedJobs = await Job.countDocuments({
      ...matchQuery,
      status: { $in: ['applied', 'wishlist'] },
      updatedAt: { $lt: fourteenDaysAgo }
    });

    const interviewRate = ((interviewingJobs / totalJobs) * 100).toFixed(1);
    const successRate = ((offeredJobs / totalJobs) * 100).toFixed(1);

    // ==========================================
    // ⚠️ NEW: TRUE GEMINI INTEGRATION
    // ==========================================
    let aiInsights = "Keep logging your applications to generate personalized insights!";

    // Only hit the AI if they have enough data to analyze
    if (totalJobs > 5) {
      try {
        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use flash for the fastest response time
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

        // Construct the prompt with the user's exact metrics
        const prompt = `
          You are an expert career coach analyzing a software developer's job application pipeline. 
          Here is their current data:
          - Total Applications: ${totalJobs}
          - Currently Interviewing: ${interviewingJobs}
          - Job Offers: ${offeredJobs}
          - Ghosted Applications (no response in 14 days): ${ghostedJobs}
          - Interview Rate: ${interviewRate}%
          - Success Rate (Offers): ${successRate}%

          Provide a short, encouraging, and highly actionable 2-3 sentence insight on what they should focus on next to improve their pipeline. 
          Be direct, professional, and do NOT use markdown formatting like asterisks or bold text. Just plain text. Also Must provide the metrics in stats (current data) to tell the user to keep applying, or to focus on interview prep, or to follow up on ghosted apps based on the data provided.
        `;

        const result = await model.generateContent(prompt);
        aiInsights = result.response.text().trim();

      } catch (geminiError) {
        console.error("Gemini API Error:", geminiError);
        // Bulletproof fallback if API fails/timeouts
        aiInsights = `Your pipeline is active with ${totalJobs} jobs! Continue applying consistently and practicing your interview skills to improve your conversion rates.`;
      }
    } else {
       aiInsights = `You have ${totalJobs} jobs in your pipeline. Add a few more applications so the AI can accurately identify bottlenecks and success trends!`;
    }

    res.status(200).json({
      success: true,
      data: { aiInsights }
    });

  } catch (error) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { getAnalytics, getAiInsights };
