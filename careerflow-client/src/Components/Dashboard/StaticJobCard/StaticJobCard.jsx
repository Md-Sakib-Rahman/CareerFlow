import React from 'react';
import { Building2, DollarSign, Calendar, ExternalLink, NotebookPen } from 'lucide-react';
import { setModal } from "../../../Redux/board/boardSlice"; // Make sure path is correct

const StaticJobCard = ({ job, dispatch }) => {
  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return null;
    const min = salary.min >= 1000 ? `${salary.min / 1000}k` : salary.min;
    const max = salary.max >= 1000 ? `${salary.max / 1000}k` : salary.max;
    return `${salary.currency === "USD" ? "$" : ""}${min}${min !== max ? ` - ${max}` : ""} ${salary.currency !== "USD" ? salary.currency : ""}`;
  };

  const statusColors = {
    wishlist: "bg-base-300 text-base-content",
    applied: "bg-info/20 text-info",
    interviewing: "bg-warning/20 text-warning",
    offer: "bg-success/20 text-success",
    rejected: "bg-error/20 text-error",
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl p-5 hover:shadow-lg transition-all group flex flex-col h-full relative overflow-hidden">
      {/* FIXED: Added so it only grabs the background color class, not the text color */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColors[job.status].split(" ")} opacity-70 group-hover:opacity-100 transition-opacity`}></div>

      <div className="flex justify-between items-start mb-3 ml-2">
        <div>
          <h3 className="font-bold text-base-content text-lg leading-tight line-clamp-1">{job.title}</h3>
          <div className="flex items-center text-sm text-base-content/70 mt-1 gap-1.5">
            <Building2 size={14} />
            <span className="font-medium truncate">{job.company}</span>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${statusColors[job.status]}`}>
          {job.status}
        </span>
      </div>

      <div className="mt-auto ml-2 space-y-3">
        {formatSalary(job.salary) && (
          <div className="flex items-center text-sm text-success/80 gap-1.5 font-semibold">
            <DollarSign size={16} />
            {formatSalary(job.salary)}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-base-content/50 pt-3 border-t border-base-200">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          
          <div className="flex gap-2">
             {job.url && (
              <a href={job.url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-base-200 rounded-md transition-colors text-primary" title="Job Link">
                <ExternalLink size={16} />
              </a>
            )}
            <button 
              onClick={() => dispatch(setModal({ modal: "view", job }))}
              className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md transition-colors font-medium"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaticJobCard;