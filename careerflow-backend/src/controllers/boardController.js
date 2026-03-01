const Board = require("../models/Board");
const Job = require("../models/Job");  
/**
 * @desc    Create a new board
 * @route   POST /api/boards
 * @access  Private
 */
const createBoard = async (req, res) => {
  try {
    const { name, isPrimary } = req.body;
    const userId = req.user.id; // From your auth middleware

    //If this new board is intended to be the Primary board, 
    // we must first find any existing primary board and unset it.
    if (isPrimary) {
      await Board.updateMany({ userId }, { isPrimary: false });
    }

    //Create the board. 
    // The 'columns' will automatically populate with the schema defaults
    const newBoard = new Board({
      userId,
      name,
      isPrimary: isPrimary || false,
    });

    const savedBoard = await newBoard.save();

    res.status(201).json({
      success: true,
      message: "Board created successfully",
      data: savedBoard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create board",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all boards for the logged-in user
 * @route   GET /api/boards
 * @access  Private
 */
const getMyBoards = async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: boards.length,
      data: boards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch boards",
      error: error.message,
    });
  }
};
/**
 * @desc    Add or Update columns in an existing board
 * @route   PATCH /api/boards/:id/columns
 */
const updateBoardColumns = async (req, res) => {
  try {
    const { columns } = req.body; 
    const boardId = req.params.id;

    const board = await Board.findOne({ _id: boardId, userId: req.user.id });
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });

    // 1. HIERARCHY DEFINITION (Weight-based)
    const hierarchyOrder = {
      wishlist: 1,
      applied: 2,
      interviewing: 3,
      offer: 4,
      rejected: 5
    };

    // 2. TYPE INTEGRITY CHECK (Must have at least one of each)
    const requiredTypes = Object.keys(hierarchyOrder);
    const incomingTypes = columns.map(col => col.internalStatus);
    const missingTypes = requiredTypes.filter(type => !incomingTypes.includes(type));

    if (missingTypes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required types: ${missingTypes.join(", ")}.`
      });
    }

    // 3. DELETE SAFETY CHECK (Same as before)
    const currentColumnIds = board.columns.map(col => col._id.toString());
    const incomingColumnIds = columns.map(col => col._id?.toString()).filter(Boolean);
    const deletedColumnIds = currentColumnIds.filter(id => !incomingColumnIds.includes(id));

    if (deletedColumnIds.length > 0) {
      const jobsInDeletedColumns = await Job.countDocuments({ columnId: { $in: deletedColumnIds } });
      if (jobsInDeletedColumns > 0) {
        return res.status(400).json({
          success: false,
          message: `Move the ${jobsInDeletedColumns} jobs out of columns before deleting.`
        });
      }
    }

    // 4. LOGICAL SORTING & INDEXING
    // We sort primarily by the user's intended position, 
    // but secondarily by the funnel hierarchy to prevent logic bugs.
    const finalizedColumns = [...columns].sort((a, b) => {
      // First, sort by internal funnel logic
      if (hierarchyOrder[a.internalStatus] !== hierarchyOrder[b.internalStatus]) {
        return hierarchyOrder[a.internalStatus] - hierarchyOrder[b.internalStatus];
      }
      // Second, within the SAME type (e.g. Round 1 vs Round 2), use the user's position
      return (a.position || 0) - (b.position || 0);
    }).map((col, index) => ({
      ...col,
      position: index // Reset clean indexing (0, 1, 2...)
    }));

    // 5. SAVE
    board.columns = finalizedColumns;
    board.markModified('columns'); 
    const updatedBoard = await board.save();

    res.status(200).json({ success: true, data: updatedBoard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @desc    Delete a board and all its associated jobs
 * @route   DELETE /api/boards/:id
 * @access  Private
 */
const deleteBoard = async (req, res) => {
  try {
    const boardId = req.params.id;
    const userId = req.user.id;

    // 1. Verify board exists and belongs to the user
    const board = await Board.findOne({ _id: boardId, userId });
    
    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: "Board not found or unauthorized" 
      });
    }

    // 2. EDGE CASE: Prevent deleting the ONLY board
    const totalBoards = await Board.countDocuments({ userId });
    if (totalBoards <= 1) {
      return res.status(400).json({
        success: false,
        message: "You must have at least one board. Create a new one before deleting this."
      });
    }

    // 3. CASCADE DELETE: Remove all jobs associated with this board
    const deletedJobs = await Job.deleteMany({ boardId });

    // 4. DELETE THE BOARD
    await Board.findByIdAndDelete(boardId);

    // 5. EDGE CASE: If the deleted board was the Primary, assign a new Primary
    if (board.isPrimary) {
      const anotherBoard = await Board.findOne({ userId });
      if (anotherBoard) {
        anotherBoard.isPrimary = true;
        await anotherBoard.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Board and ${deletedJobs.deletedCount} associated jobs deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete board",
      error: error.message,
    });
  }
};

/**
 * @desc    Set a board as the user's primary board
 * @route   PATCH /api/boards/:id/primary
 * @access  Private
 */
const setPrimaryBoard = async (req, res) => {
  try {
    const boardId = req.params.id;
    const userId = req.user.id;

    // 1. Check if the requested board actually exists and belongs to the user
    const board = await Board.findOne({ _id: boardId, userId });
    if (!board) {
      return res.status(404).json({ success: false, message: "Board not found" });
    }

    // 2. BULK UPDATE: Strip 'isPrimary' from EVERY board owned by this user
    await Board.updateMany(
      { userId: userId },
      { $set: { isPrimary: false } }
    );

    // 3. SET PRIMARY: Make the targeted board the only primary one
    board.isPrimary = true;
    const updatedBoard = await board.save();

    res.status(200).json({ success: true, data: updatedBoard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  createBoard,
  getMyBoards,
  updateBoardColumns,
  deleteBoard,
  setPrimaryBoard

};