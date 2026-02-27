import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBoards, fetchBoardJobs } from "../../Redux/board/boardSlice";
import StatCards from "../../Components/Dashboard/StatCards/StatCards";
import LoadingSpinner from "../../Components/Shared/LoadingSpinner/LoadingSpinner";
import KanbanBoard from "../../Components/Dashboard/Kanban/KanbanBoard"; 
import AddJobModal from "../../Components/Dashboard/AddJobModal/AddJobModal";
import { useState } from "react";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Pulling state from our newly created Redux slices
  const { user } = useSelector((state) => state.auth);
  const { activeBoard, jobs, loading } = useSelector((state) => state.board);

  // 1. Fetch the user's boards when the dashboard mounts
  useEffect(() => {
    dispatch(fetchMyBoards());
  }, [dispatch]);

  // 2. Whenever the activeBoard is set (e.g., the default one from registration), fetch its jobs
  useEffect(() => {
    if (activeBoard?._id) {
      dispatch(fetchBoardJobs(activeBoard._id));
    }
  }, [activeBoard, dispatch]);

  if (loading && !activeBoard) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content tracking-tight mb-2">
            Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-base-content/70">
            Here is what's happening with your <strong className="text-base-content">{activeBoard?.name || "Job Search"}</strong>.
          </p>
        </div>
        
        {/* Optional: Add Job Button (Triggers a modal later) */}
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn btn-primary shadow-lg shadow-primary/20"
        >
          + Add New Job
        </button>
      </div>

      {/* Analytics Summary */}
      <StatCards jobs={jobs} />

      {/* Kanban Board Area */}
      <div className="flex-1 rounded-2xl bg-base-100/40 backdrop-blur-sm border border-base-300 p-2 md:p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2 pb-4 mb-2 border-b border-base-300">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Application Pipeline
          </h2>
        </div>
        
        {/* The Drag & Drop Context will go here */}
        <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-4">
          {/* <KanbanBoard columns={activeBoard?.columns} jobs={jobs} /> */}
          <div className="h-64 flex items-center justify-center text-base-content/50  rounded-xl mt-4">
            {activeBoard?.columns ? (
            <KanbanBoard columns={activeBoard.columns} initialJobs={jobs} />
          ) : (
            <div className="h-64 flex items-center justify-center text-base-content/50 border-2 border-dashed border-base-300 rounded-xl mt-4">
              <p>Loading board data...</p>
            </div>
          )}
          </div>
        </div>

      </div>
      <AddJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        activeBoard={activeBoard} 
      />    
    </div>
  );
};

export default DashboardPage;