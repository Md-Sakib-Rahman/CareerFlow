import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyBoards, fetchBoardJobs, setActiveBoard } from "../../Redux/board/boardSlice";
import { Plus } from "lucide-react";
import CreateBoardModal from "../../Components/Dashboard/CreateBoardModal/CreateBoardModal";
import BoardCard from "../../Components/Dashboard/BoardCard/BoardCard";
import BoardKanbanView from "../../Components/Dashboard/BoardKanbanView/BoardKanbanView";



const BoardsPage = () => {
  const dispatch = useDispatch();
  const { boards, activeBoard, loading } = useSelector((state) => state.board);

  // View States
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'board'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // ==========================================
  // RENDER ROUTING
  // ==========================================
  
  if (viewMode === "board" && activeBoard) {
    return <BoardKanbanView activeBoard={activeBoard} onBack={() => setViewMode("list")} />;
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
          onClick={() => setIsCreateModalOpen(true)}
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
              <h3 className="font-bold text-base-content">Create your first board</h3>
              <p className="text-sm text-base-content/50 mt-1">Start tracking your applications</p>
            </div>
          )}
        </div>
      )}

      {/* Global Modals for List View */}
      <CreateBoardModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default BoardsPage;