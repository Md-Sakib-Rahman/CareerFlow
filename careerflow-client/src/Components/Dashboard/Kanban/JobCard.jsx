import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, Calendar } from "lucide-react";

const JobCard = ({ job, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job._id, data: { ...job } });

  // Only apply the Dnd-kit transform to the actual card, not the overlay clone!
 const style = isOverlay ? { cursor: 'grabbing' } : {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const addedDate = new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="h-28 bg-base-300 border-2 border-primary border-dashed rounded-xl opacity-50 mb-3"
      />
    );
  }

  return (
    <div
      ref={isOverlay ? null : setNodeRef} 
      style={style} 
      // ONLY attach listeners if NOT an overlay. 
      // Listeners on the overlay cause "ghost" mouse movements.
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={`bg-base-100 border border-base-300 rounded-xl p-4 group relative
        ${isOverlay 
          ? 'shadow-2xl ring-2 ring-primary m-0 cursor-grabbing scale-105 pointer-events-none' 
          : 'shadow-sm hover:shadow-md hover:bg-base-200 cursor-grab active:cursor-grabbing mb-3 transition-colors'
        }`
      }
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover:bg-primary rounded-l-xl transition-colors"></div>

      <div className="flex justify-between items-start mb-2 ml-1">
        <h3 className="font-bold text-base-content text-sm leading-tight line-clamp-2">
          {job.title}
        </h3>
      </div>
      
      <div className="ml-1 space-y-1.5 mt-3">
        <div className="flex items-center text-xs text-base-content/70 gap-2">
          <Building2 size={14} className="text-base-content/50" />
          <span className="truncate">{job.company}</span>
        </div>
        
        <div className="flex items-center justify-between text-[10px] text-base-content/50 mt-3 pt-3 border-t border-base-200">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Added {addedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
