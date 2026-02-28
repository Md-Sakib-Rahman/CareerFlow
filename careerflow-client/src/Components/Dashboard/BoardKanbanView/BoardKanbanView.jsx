import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import KanbanContainer from "../../../Components/Dashboard/Kanban/KanbanContainer";
import AddJobModal from "../../../Components/Dashboard/AddJobModal/AddJobModal";

const BoardKanbanView = ({ activeBoard, onBack }) => {
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);

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

      {/* The reusable Kanban Container */}
      <KanbanContainer />

      {/* Modals scoped to this view */}
      <AddJobModal 
        isOpen={isAddJobOpen} 
        onClose={() => setIsAddJobOpen(false)} 
        activeBoard={activeBoard} 
      />
    </div>
  );
};

export default BoardKanbanView;