import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Actions
import { fetchMyBoards, fetchBoardJobs, clearModal } from "../../Redux/board/boardSlice";

// Components
import StatCards from "../../Components/Dashboard/StatCards/StatCards";
import LoadingSpinner from "../../Components/Shared/LoadingSpinner/LoadingSpinner";
import KanbanContainer from "../../Components/Dashboard/Kanban/KanbanContainer";

// Modals
import AddJobModal from "../../Components/Dashboard/AddJobModal/AddJobModal";
import EditJobModal from "../../Components/Dashboard/EditJobModal/EditJobModal";
import ViewJobModal from "../../Components/Dashboard/ViewJobModal/ViewJobModal";
import SetReminderModal from "../../Components/Dashboard/SetReminderModal/SetReminderModal";

const DashboardPage = () => {
  const dispatch = useDispatch();
  
  // 1. SELECTORS: Pull only what we need for the layout and initialization
  const { user } = useSelector((state) => state.auth);
  const { activeBoard, loading } = useSelector((state) => state.board);
  const { activeModal, selectedJob } = useSelector((state) => state.board.ui);

  // Local state only for the "Add New Job" trigger
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

  // 2. DATA INITIALIZATION
  useEffect(() => {
    dispatch(fetchMyBoards());
  }, [dispatch]);

  useEffect(() => {
    if (activeBoard?._id) {
      dispatch(fetchBoardJobs(activeBoard._id));
    }
  }, [activeBoard, dispatch]);

  if (loading && !activeBoard) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content tracking-tight mb-2">
            Welcome back,{" "}
            <span className="text-primary">{user?.name?.split(" ")}</span> 👋
          </h1>
          <p className="text-base-content/70">
            Managing search: <strong className="text-base-content">{activeBoard?.name || "Loading..."}</strong>
          </p>
        </div>
        <button
          onClick={() => setIsAddJobOpen(true)}
          className="btn btn-primary shadow-lg shadow-primary/20"
        >
          + Add New Job
        </button>
      </div>

      {/* Analytics Summary - Now internalizing its own data via useSelector */}
      <StatCards />

      {/* The Kanban Container - No props needed! */}
      <KanbanContainer />

      {/* ==========================================
          GLOBAL MODALS (Controlled via Redux UI)
          ========================================== */}
      
      {/* 1. Add Job (Still local state as it's triggered from this page only) */}
      <AddJobModal 
        isOpen={isAddJobOpen} 
        onClose={() => setIsAddJobOpen(false)} 
        activeBoard={activeBoard} 
      />

      {/* 2. View Modal */}
      {activeModal === "view" && (
        <ViewJobModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}

      {/* 3. Edit Modal */}
      {activeModal === "edit" && (
        <EditJobModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}

      {/* 4. Reminder Modal */}
      {activeModal === "reminder" && (
        <SetReminderModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}
    </div>
  );
};

export default DashboardPage;
