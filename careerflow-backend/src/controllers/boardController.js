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

    // --- 1. HANDLE COLUMN DELETION ---
    const currentColumnIds = board.columns.map(col => col._id.toString());
    const incomingColumnIds = columns.map(col => col._id?.toString()).filter(Boolean);
    
    // Find columns that are in the database but NOT in the new request
    const deletedColumnIds = currentColumnIds.filter(id => !incomingColumnIds.includes(id));

    if (deletedColumnIds.length > 0) {
      // Check if any of these columns contain jobs
      const jobsInDeletedColumns = await Job.countDocuments({ 
        columnId: { $in: deletedColumnIds } 
      });

      if (jobsInDeletedColumns > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete column(s). There are ${jobsInDeletedColumns} jobs still assigned to them. Move the jobs first.`
        });
      }
    }

    // --- 2. VALIDATE HIERARCHY (Keep your existing logic) ---
    const hierarchyOrder = ["wishlist", "applied", "interviewing", "offer", "rejected", "archived"];
    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

    for (let i = 0; i < sortedColumns.length - 1; i++) {
      if (hierarchyOrder.indexOf(sortedColumns[i].internalStatus) > 
          hierarchyOrder.indexOf(sortedColumns[i + 1].internalStatus)) {
        return res.status(400).json({
          success: false,
          message: `Logical Error: A ${sortedColumns[i+1].internalStatus} column cannot come after a ${sortedColumns[i].internalStatus} column.`
        });
      }
    }

    // --- 3. SAVE ---
    board.markModified('columns'); 
    board.columns = columns;
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
module.exports = {
  createBoard,
  getMyBoards,
  updateBoardColumns,
  deleteBoard

};