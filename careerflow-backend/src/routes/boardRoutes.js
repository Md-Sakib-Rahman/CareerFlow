const express = require("express");
const router = express.Router();
const {
  createBoard,
  getMyBoards,
  updateBoardColumns,
  deleteBoard,
  setPrimaryBoard
} = require("../controllers/boardController");
const { protect } = require("../middleware/authMiddleware");

// All board routes require authentication  
router.use(protect);

// Main board endpoints
router.route("/")
  .post(createBoard)  // POST /api/boards - Create a new board  
  .get(getMyBoards);  // GET /api/boards - Get all user's boards  

// Specific board endpoints
router.route("/:id")
  .delete(deleteBoard); // DELETE /api/boards/:id - Cascade delete board & jobs  

// Column management
router.route("/:id/columns")
  .patch(updateBoardColumns); // PATCH /api/boards/:id/columns - Validate & update columns  


router.patch("/:id/primary", protect, setPrimaryBoard);


module.exports = router;