import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import JobCard from "./JobCard";
import { useState } from "react";
import { Trash2, Edit2, Check, X as CloseX } from "lucide-react";
const KanbanColumn = ({
  column,
  jobs,
  onAction,
  onUpdateColumn,
  activeBoard,
}) => {
  const { setNodeRef } = useDroppable({
    id: column._id,
    data: { internalStatus: column.internalStatus },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);
  const columnJobs = jobs.filter((job) => job.columnId === column._id);
  const jobIds = columnJobs.map((job) => job._id);
  const handleTitleSubmit = () => {
    // 1. If the title is empty or hasn't changed, just close the input
    if (!newTitle.trim() || newTitle === column.title) {
      setIsEditing(false);
      setNewTitle(column.title);
      return;
    }

    // 2. Use activeBoard.columns instead of just 'board'
    const updatedCols = activeBoard.columns.map((c) =>
      c._id === column._id ? { ...c, title: newTitle } : c,
    );

    // 3. Send the updated array up to the Dashboard
    onUpdateColumn(updatedCols);
    setIsEditing(false);
  };
  // const handleTitleSubmit = () => {
  //   // Logic to dispatch updated columns array where this column has a new title

  //   const updatedCols = board.columns.map(c =>
  //     c._id === column._id ? { ...c, title: newTitle } : c
  //   );
  //   onUpdateColumn(updatedCols);
  //   setIsEditing(false);
  // };
  const handleDeleteColumn = () => {
    // 1. Frontend Safety Check
    const columnJobs = jobs.filter((job) => job.columnId === column._id);
    if (columnJobs.length > 0) {
      alert(`This column contains ${columnJobs.length} jobs. Please move them to another stage before deleting this column.`);
      return;
    }

    // 2. Type Integrity Check
    const otherColumnsOfSameType = activeBoard.columns.filter(
      c => c.internalStatus === column.internalStatus && c._id !== column._id
    );
    
    if (otherColumnsOfSameType.length === 0) {
      alert(`Cannot delete the only '${column.internalStatus}' column. Every board needs at least one.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the "${column.title}" stage?`)) {
      const updatedCols = activeBoard.columns.filter(c => c._id !== column._id);
      onUpdateColumn(updatedCols);
    }
  };
  return (
    <div className="flex flex-col w-80 min-w-[320px] bg-base-200/50 border border-base-300 rounded-2xl p-3 max-h-full">
      <div className="flex items-center justify-between mb-4 px-2 ">
        {/* <h2 className="font-bold text-base-content/80 text-sm tracking-wide uppercase flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/60"></span>
          {column.title}
        </h2> */}
        {isEditing ? (
          <input
            autoFocus
            value={newTitle}
            onBlur={handleTitleSubmit}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSubmit();
              if (e.key === "Escape") {
                setIsEditing(false);
                setNewTitle(column.title);
              }
            }}
            className="input input-xs bg-base-100 border-primary focus:outline-none w-full max-w-[150px]"
          />
        ) : (
          <h2
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:text-primary transition-colors"
          >
            {column.title}
          </h2>
        )}
        <div className="flex items-center gap-2">
          <div className="bg-base-300 text-base-content/70 text-xs font-bold px-2 py-0.5 rounded-full">
          {columnJobs.length}
        </div>
          {!isEditing && (
            <button 
              onClick={handleDeleteColumn}
              className=" p-1 hover:text-error transition-all"
              title="Delete Stage"
            >
              <Trash2 size={14} className="text-red-700" />
            </button>
          )}
        
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-visible overflow-x-visible px-1 min-h-[150px] custom-scrollbar"
      >
        <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
          {columnJobs.map((job) => (
            <JobCard key={job._id} job={job} onAction={onAction} />
          ))}
        </SortableContext>

        {columnJobs.length === 0 && (
          <div className="h-24 border-2 border-dashed border-base-300 rounded-xl flex items-center justify-center text-base-content/40 text-sm">
            Drop jobs here
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
