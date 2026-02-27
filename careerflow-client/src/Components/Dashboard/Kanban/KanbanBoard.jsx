import React, { useState, useEffect } from "react";
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useDispatch } from "react-redux";
import { updateJobColumn } from "../../../Redux/board/boardSlice";
import KanbanColumn from "./KanbanColumn";
import JobCard from "./JobCard";
import { createPortal } from "react-dom";
const KanbanBoard = ({ columns, initialJobs, onAction }) => {
  const dispatch = useDispatch();
  const [localJobs, setLocalJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);  
  useEffect(() => {
    setLocalJobs(initialJobs || []);
  }, [initialJobs]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
const handleDragStart = (event) => {
    const { active } = event;
    const job = localJobs.find((j) => j._id === active.id);
    setActiveJob(job);
  };
  const handleDragEnd = (event) => {
    setActiveJob(null);
    const { active, over } = event;
    if (!over) return; 

    const activeJobId = active.id;
    const overId = over.id;

    if (activeJobId === overId) return;

    const activeJob = localJobs.find((job) => job._id === activeJobId);
    if (!activeJob) return;

    // Check if we dropped over a column directly OR over another card inside a column
    const isOverColumn = columns.some((col) => col._id === overId);
    const destinationColumnId = isOverColumn 
      ? overId 
      : localJobs.find((job) => job._id === overId)?.columnId;
    
    if (!destinationColumnId || activeJob.columnId === destinationColumnId) return;

    const destinationColumnConfig = columns.find(col => col._id === destinationColumnId);

    // 1. Optimistic UI Update: Instantly snap the card into the new column
    setLocalJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === activeJobId
          ? { ...job, columnId: destinationColumnId, status: destinationColumnConfig.internalStatus }
          : job
      )
    );

    // 2. Dispatch to Backend: Save the new state securely
    dispatch(updateJobColumn({ 
      jobId: activeJobId, 
      columnId: destinationColumnId, 
      status: destinationColumnConfig.internalStatus 
    }));
  };

  if (!columns || columns.length === 0) return null;

  return (
<DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full w-full">
        {columns.map((column) => (
          <KanbanColumn key={column._id} column={column} jobs={localJobs} onAction={onAction}/>
        ))}
      </div>

      {/* This teleports the card outside of your Dashboard's CSS transforms */}
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeJob ? (
            <div className="z-[9999] pointer-events-none">
              <JobCard job={activeJob} isOverlay={true} />
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
 
  );
};

export default KanbanBoard;