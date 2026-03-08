import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Building2,
  Calendar,
  MoreVertical,
  Eye,
  Bell,
  ArrowRight,
  Edit3,
  Trash2,
  ExternalLink,
  DollarSign,
  X,
  NotebookPen,
} from "lucide-react";

// Redux Actions
import { 
  setModal, 
  moveToNextStage, 
  moveToPreviousStage, 
  rejectJobAction, 
  deleteJob 
} from "../../../Redux/board/boardSlice";

const JobCard = ({ job, isOverlay }) => {
  const dispatch = useDispatch();
  
  // 1. Get column configuration directly from Redux instead of props
  const { activeBoard } = useSelector((state) => state.board);
  const columns = activeBoard?.columns || [];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job._id, data: { ...job } });

  // 2. Logic for conditional rendering of stage buttons
  const isFirstStage = job.status === "wishlist";
  const isFinalStage = job.status === "offer" || job.status === "rejected";

  // 3. Salary Formatter Helper
  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return null;
    const min = salary.min >= 1000 ? `${salary.min / 1000}k` : salary.min;
    const max = salary.max >= 1000 ? `${salary.max / 1000}k` : salary.max;

    if (salary.min === salary.max)
      return `${salary.currency === "USD" ? "$" : ""}${min} ${salary.currency !== "USD" ? salary.currency : ""}`;
    return `${salary.currency === "USD" ? "$" : ""}${min} - ${max} ${salary.currency !== "USD" ? salary.currency : ""}`;
  };

  // 4. Integrated Action Handler (Direct Redux Dispatches)
  const handleAction = (e, actionType) => {
    e.stopPropagation();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    switch (actionType) {
      case "next":
        dispatch(moveToNextStage({ job, columns }));
        break;
      case "prev":
        dispatch(moveToPreviousStage({ job, columns }));
        break;
      case "reject_quick":
        if (window.confirm(`Mark ${job.company} as Rejected?`)) {
          dispatch(rejectJobAction({ job, columns }));
        }
        break;
      case "delete":
        if (window.confirm(`Permanently delete ${job.title}?`)) {
          dispatch(deleteJob(job._id));
        }
        break;
      // Default handles "view", "edit", and "reminder" modals
      default:
        dispatch(setModal({ modal: actionType, job }));
        break;
    }
  };

  const style = isOverlay
    ? { cursor: "grabbing" }
    : {
        transform: CSS.Translate.toString(transform),
        transition,
      };

  const addedDate = new Date(job.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

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
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={`bg-base-100 border border-base-300 rounded-xl p-4 group relative
        ${
          isOverlay
            ? "shadow-2xl ring-2 ring-primary m-0 cursor-grabbing scale-105 pointer-events-none z-"
            : "shadow-sm hover:shadow-md hover:bg-base-200 cursor-grab active:cursor-grabbing mb-3 transition-colors"
        }`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover:bg-primary rounded-l-xl transition-colors"></div>

      <div className="flex justify-between items-start mb-2 ml-1">
        <h3 className="font-bold text-base-content text-sm leading-tight line-clamp-2 pr-2">
          {job.title}
        </h3>

        {!isOverlay && (
          <div
            className="dropdown dropdown-bottom dropdown-end"
            onClick={(e) => e.stopPropagation()}
          >
            <label
              tabIndex={0}
              className="p-1 hover:bg-base-300 rounded-md cursor-pointer text-base-content/40 hover:text-base-content transition-colors block"
            >
              <MoreVertical size={16} />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z- menu p-2 shadow-2xl bg-base-100 border border-base-300 rounded-xl w-52 text-sm mt-0"
            >
              <li>
                <button onClick={(e) => handleAction(e, "view")}>
                  <Eye size={16} /> View Details
                </button>
              </li>
              <li>
                <button onClick={(e) => handleAction(e, "edit")}>
                  <Edit3 size={16} /> Edit Job
                </button>
              </li>
              <li>
                <button onClick={(e) => handleAction(e, "add_note")}>
                  <NotebookPen size={16} /> Add Note
                </button>
              </li>
              <li>
                <button onClick={(e) => handleAction(e, "reminder")}>
                  <Bell size={16} /> Set Reminder
                </button>
              </li>
              
              {/* Previous Stage Logic */}
              {!isFirstStage && (
                <li>
                  <button
                    onClick={(e) => handleAction(e, "prev")}
                    className="text-warning font-medium"
                  >
                    <ArrowRight size={16} className="rotate-180" /> Previous Stage
                  </button>
                </li>
              )}

              {/* Next Stage Logic */}
              {!isFinalStage && (
                <li>
                  <button
                    onClick={(e) => handleAction(e, "next")}
                    className="text-primary font-bold"
                  >
                    <ArrowRight size={16} /> Next Stage
                  </button>
                </li>
              )}

              {/* Reject Logic */}
              {job.status !== "rejected" && (
                <li>
                  <button
                    onClick={(e) => handleAction(e, "reject_quick")}
                    className="text-orange-600 font-medium"
                  >
                    <X size={16} /> Reject Application
                  </button>
                </li>
              )}
              
              {job.url && (
                <li>
                  <a href={job.url} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} /> Job Link
                  </a>
                </li>
              )}
              <div className="divider my-1"></div>
              <li>
                <button
                  onClick={(e) => handleAction(e, "delete")}
                  className="text-error hover:bg-error/10"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="ml-1 space-y-2 mt-3">
        <div className="flex items-center text-xs text-base-content/70 gap-2">
          <Building2 size={14} className="text-base-content/50" />
          <span className="truncate font-medium">{job.company}</span>
        </div>

        {formatSalary(job.salary) && (
          <div className="flex items-center text-[11px] text-success/80 gap-2">
            <DollarSign size={13} />
            <span className="font-bold">{formatSalary(job.salary)}</span>
          </div>
        )}

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
