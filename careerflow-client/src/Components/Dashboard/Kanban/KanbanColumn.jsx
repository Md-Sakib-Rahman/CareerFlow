import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import JobCard from "./JobCard";

const KanbanColumn = ({ column, jobs }) => {
  const { setNodeRef } = useDroppable({
    id: column._id,
    data: { internalStatus: column.internalStatus }
  });

  const columnJobs = jobs.filter((job) => job.columnId === column._id);
  const jobIds = columnJobs.map((job) => job._id);

  return (
    <div className="flex flex-col w-80 min-w-[320px] bg-base-200/50 border border-base-300 rounded-2xl p-3 max-h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-bold text-base-content/80 text-sm tracking-wide uppercase flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/60"></span>
          {column.title}
        </h2>
        <div className="bg-base-300 text-base-content/70 text-xs font-bold px-2 py-0.5 rounded-full">
          {columnJobs.length}
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto custom-scrollbar px-1 min-h-[150px]">
        <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
          {columnJobs.map((job) => (
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