import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMyBoards,
  fetchBoardJobs,
  setActiveBoard,
  deleteBoardAction,
} from "../../Redux/board/boardSlice";
import { AlertTriangle, Plus, Crown } from "lucide-react";
import CreateBoardModal from "../../Components/Dashboard/CreateBoardModal/CreateBoardModal";
import BoardCard from "../../Components/Dashboard/BoardCard/BoardCard";
import BoardKanbanView from "../../Components/Dashboard/BoardKanbanView/BoardKanbanView";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router";

const BoardsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { boards, activeBoard, loading } = useSelector((state) => state.board);

  // View States
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'board'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Fetch boards on mount if we don't have them
  useEffect(() => {
    if (boards.length === 0) {
      dispatch(fetchMyBoards());
    }
  }, [dispatch, boards.length]);

  // Handle entering a board
  const handleOpenBoard = (board) => {
    dispatch(setActiveBoard(board));
    dispatch(fetchBoardJobs(board._id));
    setViewMode("board");
  };
  const handleConfirmDelete = async () => {
    if (!boardToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteBoardAction(boardToDelete._id)).unwrap();
      toast.success("Board deleted successfully!");
      setBoardToDelete(null); // Close the modal
    } catch (error) {
      toast.error(error.message || "Failed to delete board.");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleCreateClick = () => {
    const plan = user?.plan?.toLowerCase() || 'starter';
    const boardCount = boards.length;

    // Check Starter Limit (Max 1)
    if (plan === 'starter' && boardCount >= 1) {
      setShowUpgradePrompt(true);
      return;
    }

    // Check Pro Limit (Max 10)
    if (plan === 'pro' && boardCount >= 10) {
      setShowUpgradePrompt(true);
      return;
    }

    // If limits aren't hit (or they are Executive), open normal modal
    setIsCreateModalOpen(true);
  };
  // ==========================================
  // RENDER ROUTING
  // ==========================================

  if (viewMode === "board" && activeBoard) {
    return (
      <BoardKanbanView
        activeBoard={activeBoard}
        onBack={() => setViewMode("list")}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-full min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-base-content">My Boards</h1>
          <p className="text-sm text-base-content/60 mt-1">
            Manage your job search pipelines
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="btn btn-primary gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Create Board
        </button>
      </div>

      {/* Grid Area */}
      {loading && boards.length === 0 ? (
        <div className="flex-1 flex justify-center items-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <BoardCard
              key={board._id}
              board={board}
              onOpen={handleOpenBoard}
              onDeleteClick={() => setBoardToDelete(board)}
            />
          ))}

          {/* Empty State / "Create New" Card */}
          {boards.length === 0 && (
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="border-2 border-dashed border-base-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-base-200 hover:border-primary/50 transition-colors min-h-[200px]"
            >
              <div className="w-12 h-12 bg-base-100 rounded-full flex items-center justify-center mb-3 text-base-content/50">
                <Plus size={24} />
              </div>
              <h3 className="font-bold text-base-content">
                Create your first board
              </h3>
              <p className="text-sm text-base-content/50 mt-1">
                Start tracking your applications
              </p>
            </div>
          )}
        </div>
      )}

      {/* Global Modals for List View */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      {showUpgradePrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-secondary/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-4">
                <Crown size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Limit Reached</h2>
              <p className="text-base-content/70 mb-8">
                Your current <span className="capitalize font-bold">{user?.plan || 'Starter'}</span> plan has reached its maximum board limit. Upgrade your account to unlock more boards and advanced features.
              </p>
              
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setShowUpgradePrompt(false)} 
                  className="btn flex-1 rounded-xl"
                >
                  Maybe Later
                </button>
                <button 
                  onClick={() => navigate('/upgrade')} 
                  className="btn btn-secondary flex-1 rounded-xl shadow-lg shadow-secondary/20 text-white"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {boardToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm p-4">
          <div className="bg-base-100 p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-error/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Delete Board?</h2>
              <p className="text-base-content/70 mb-8">
                Are you sure you want to delete{" "}
                <strong className="text-base-content">
                  {boardToDelete.name}
                </strong>
                ? This action will permanently delete all jobs inside this board
                and cannot be undone.
              </p>

              <div className="flex w-full gap-4">
                <button
                  onClick={() => setBoardToDelete(null)}
                  className="btn flex-1 rounded-xl"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="btn btn-error flex-1 rounded-xl shadow-lg shadow-error/20 text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardsPage;
