import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

// Redux Actions
import { updateJobColumn } from "../../../Redux/board/boardSlice";

// Components
import KanbanColumn from "./KanbanColumn";
import JobCard from "./JobCard";

const KanbanBoard = () => {
  const dispatch = useDispatch();
  
  // 1. SELECTORS: Get everything from Redux instead of props
  const { activeBoard, jobs } = useSelector((state) => state.board);
  const columns = activeBoard?.columns || [];

  const [localJobs, setLocalJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);

  // Sync local jobs with Redux jobs when they change
  useEffect(() => {
    setLocalJobs(jobs || []);
  }, [jobs]);

  // DND-KIT Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

    const currentJob = localJobs.find((job) => job._id === activeJobId);
    if (!currentJob) return;

    // Determine destination column
    const isOverColumn = columns.some((col) => col._id === overId);
    const destinationColumnId = isOverColumn
      ? overId
      : localJobs.find((job) => job._id === overId)?.columnId;

    if (!destinationColumnId || currentJob.columnId === destinationColumnId) return;

    const destColConfig = columns.find((col) => col._id === destinationColumnId);

    // 2. OPTIMISTIC UI UPDATE
    setLocalJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === activeJobId
          ? {
              ...job,
              columnId: destinationColumnId,
              status: destColConfig.internalStatus,
            }
          : job
      )
    );

    // 3. DISPATCH TO BACKEND
    dispatch(
      updateJobColumn({
        jobId: activeJobId,
        columnId: destinationColumnId,
        status: destColConfig.internalStatus,
      })
    );
  };

  if (!columns.length) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full w-full">
        {columns.map((column) => (
          /* Notice: No more activeBoard, onAction, or onUpdateColumn props! */
          <KanbanColumn 
            key={column._id} 
            column={column} 
            jobs={localJobs} 
          />
        ))}
      </div>

      {/* Drag Overlay Portal */}
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeJob ? (
            <div className="z- pointer-events-none">
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
