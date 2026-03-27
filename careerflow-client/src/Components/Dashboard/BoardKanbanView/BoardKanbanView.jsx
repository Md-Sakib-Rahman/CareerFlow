import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import KanbanContainer from "../../../Components/Dashboard/Kanban/KanbanContainer";
import AddJobModal from "../../../Components/Dashboard/AddJobModal/AddJobModal";
import { useDispatch, useSelector } from "react-redux";
import { clearModal } from "../../../Redux/board/boardSlice";
import ViewJobModal from "../ViewJobModal/ViewJobModal";
import EditJobModal from "../EditJobModal/EditJobModal";
import SetReminderModal from "../SetReminderModal/SetReminderModal";
import NotePadModal from "../NotePadModal/NotePadModal";

// ⚠️ NEW: A custom skeleton loader that mimics your Kanban columns
const KanbanSkeleton = () => (
  <div className="flex gap-4 h-full w-full overflow-hidden opacity-60">
    {[1, 2, 3, 4].map((col) => (
      <div key={col} className="w-80 flex-shrink-0 bg-base-200/50 rounded-2xl p-4 flex flex-col gap-3">
        {/* Column Header Skeleton */}
        <div className="h-6 w-32 bg-base-300 animate-pulse rounded-md mb-2"></div>
        {/* Job Card Skeletons */}
        {[1, 2, 3].map((card) => (
          <div key={card} className="h-28 w-full bg-base-100 animate-pulse rounded-xl border border-base-300"></div>
        ))}
      </div>
    ))}
  </div>
);

const BoardKanbanView = ({ activeBoard, onBack }) => {
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const dispatch = useDispatch();
  
  // ⚠️ NEW: Grab the loading state from your board slice
  const { loading } = useSelector((state) => state.board);
  const { activeModal, selectedJob } = useSelector((state) => state.board.ui);

  if (!activeBoard) return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-full min-h-[calc(100vh-4rem)]">
      {/* Custom Header for Board View */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:bg-base-200 hover:text-primary transition-colors"
            title="Back to Boards"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-base-content tracking-tight leading-none">
              {activeBoard.name}
            </h1>
            <span className="text-xs text-base-content/50 font-medium">Pipeline View</span>
          </div>
        </div>

        <button
          onClick={() => setIsAddJobOpen(true)}
          className="btn btn-primary btn-sm md:btn-md shadow-lg shadow-primary/20"
        >
          + Add New Job
        </button>
      </div>

      {/* ⚠️ NEW: Conditionally render the Skeleton while loading, then swap to the real Kanban */}
      {loading ? <KanbanSkeleton /> : <KanbanContainer />}

      {/* Modals scoped to this view */}
      <AddJobModal 
        isOpen={isAddJobOpen} 
        onClose={() => setIsAddJobOpen(false)} 
        activeBoard={activeBoard} 
      />

      {/* View Modal */}
      {activeModal === "view" && (
        <ViewJobModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}

      {/* Edit Modal */}
      {activeModal === "edit" && (
        <EditJobModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}

      {/* Reminder Modal */}
      {activeModal === "reminder" && (
        <SetReminderModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}

      {/* Note Pad Modal */}
      {activeModal === "notePad" && (
        <NotePadModal 
          job={selectedJob} 
          onClose={() => dispatch(clearModal())} 
        />
      )}
    </div>
  );
};

export default BoardKanbanView;
