import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Trash2, Edit2 } from "lucide-react";

// Redux Actions
import { updateBoardColumns } from "../../../Redux/board/boardSlice";

// Components
import JobCard from "./JobCard";

const KanbanColumn = ({ column, jobs }) => {
  const dispatch = useDispatch();
  
  // 1. SELECTORS: Get activeBoard metadata directly
  const { activeBoard } = useSelector((state) => state.board);

  const { setNodeRef } = useDroppable({
    id: column._id,
    data: { internalStatus: column.internalStatus },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);

  // Filter jobs for this specific column
  const columnJobs = jobs.filter((job) => job.columnId === column._id);
  const jobIds = columnJobs.map((job) => job._id);

  // 2. ACTION: Update Column Title
  // const handleTitleSubmit = () => {
  //   if (!newTitle.trim() || newTitle === column.title) {
  //     setIsEditing(false);
  //     setNewTitle(column.title);
  //     return;
  //   }

  //   const updatedCols = activeBoard.columns.map((c) =>
  //     c._id === column._id ? { ...c, title: newTitle } : c
  //   );

  //   dispatch(updateBoardColumns({ 
  //     boardId: activeBoard._id, 
  //     columns: updatedCols 
  //   }));
  //   setIsEditing(false);
  // };
const handleTitleSubmit = () => {
    if (!newTitle.trim() || newTitle === column.title) {
      setIsEditing(false);
      setNewTitle(column.title);
      return;
    }

    // 100% Accurate Data Sanitization:
    // We rebuild the object explicitly to drop any hidden properties (__v, timestamps, etc.)
    // that might trigger a 400 Bad Request on your backend's strict validation.
    const updatedCols = activeBoard.columns.map((c) => ({
      _id: c._id,
      title: c._id === column._id ? newTitle.trim() : c.title,
      internalStatus: c.internalStatus,
      position: c.position || 0
    }));

    dispatch(updateBoardColumns({ 
      boardId: activeBoard._id, 
      columns: updatedCols 
    }));
    setIsEditing(false);
  };
  // 3. ACTION: Delete Column
  const handleDeleteColumn = () => {
    // Safety check: Is the column empty?
    if (columnJobs.length > 0) {
      alert(`This column contains ${columnJobs.length} jobs. Move them before deleting.`);
      return;
    }

    // Integrity check: Is this the last column of this type?
    const otherColsOfSameType = activeBoard.columns.filter(
      (c) => c.internalStatus === column.internalStatus && c._id !== column._id
    );

    if (otherColsOfSameType.length === 0) {
      alert(`Every board needs at least one '${column.internalStatus}' column.`);
      return;
    }

    if (window.confirm(`Delete the "${column.title}" stage?`)) {
      const updatedCols = activeBoard.columns.filter((c) => c._id !== column._id);
      dispatch(updateBoardColumns({ 
        boardId: activeBoard._id, 
        columns: updatedCols 
      }));
    }
  };

  return (
    <div className="flex flex-col w-80 min-w-[320px] bg-base-200/50 border border-base-300 rounded-2xl p-3 max-h-full">
      {/* Header with 'group' for hover effects */}
      <div className="flex items-center justify-between mb-4 px-2 group">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
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
              className="font-bold text-base-content/80 text-sm tracking-wide uppercase cursor-pointer hover:text-primary transition-colors truncate"
            >
              {column.title}
            </h2>
          )}
          
          {/* Delete Button (Visible on group hover) */}
          {!isEditing && (
            <button
              onClick={handleDeleteColumn}
              className=" p-1 text-base-content/30 hover:text-error transition-all"
              title="Delete Stage"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="bg-base-300 text-base-content/70 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
          {columnJobs.length}
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-visible overflow-x-visible px-1 min-h-[150px] custom-scrollbar"
      >
        <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
          {columnJobs.map((job) => (
            /* Note: JobCard also doesn't need onAction props anymore! */
            <JobCard key={job._id} job={job} />
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
