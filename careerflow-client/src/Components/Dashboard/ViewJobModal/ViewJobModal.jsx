import React from "react";
import { 
  X, Building2, MapPin, DollarSign, Link as LinkIcon, 
  Calendar, Clock, CheckCircle2, NotebookText, Bell
} from "lucide-react";

const ViewJobModal = ({ job, onClose }) => {
  if (!job) return null;

  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-US", { 
    month: "long", day: "numeric", year: "numeric" 
  }) : "Not set";

  const statusColors = {
    wishlist: "badge-ghost",
    applied: "badge-primary",
    interviewing: "badge-secondary",
    offer: "badge-success",
    rejected: "badge-error",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm px-4">
      <div className="bg-base-100 w-full max-w-2xl rounded-3xl shadow-2xl border border-base-300 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="p-6 border-b border-base-200 bg-base-200/30 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold text-2xl">
              {job.company.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">{job.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base-content/60 font-medium">{job.company}</span>
                <div className={`badge ${statusColors[job.status]} badge-sm capitalize font-bold p-3`}>
                  {job.status}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-base-200 rounded-lg text-base-content/50"><MapPin size={18}/></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-base-content/40">Location</p>
                  <p className="text-sm font-semibold">{job.location || "Remote / Not Specified"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-base-200 rounded-lg text-base-content/50"><DollarSign size={18}/></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-base-content/40">Salary Range</p>
                  <p className="text-sm font-semibold">
                    {job.salary?.min ? `${job.salary.currency} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}` : "Not Specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary hover:underline cursor-pointer">
                <div className="p-2 bg-primary/10 rounded-lg"><LinkIcon size={18}/></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-primary/60">Job Posting</p>
                  {job.url ? (
                    <a href={job.url} target="_blank" rel="noreferrer" className="text-sm font-semibold break-all">View Listing</a>
                  ) : <p className="text-sm font-semibold text-base-content/30">No link provided</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-base-200 rounded-lg text-base-content/50"><Clock size={18}/></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-base-content/40">Application Age</p>
                  <p className="text-sm font-semibold italic">Added {formatDate(job.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-base-200" />

          {/* Timeline / Milestones */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/40 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} /> Application Timeline
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`p-3 rounded-xl border ${job.isApplied ? 'bg-primary/5 border-primary/20' : 'bg-base-200/50 border-transparent text-base-content/30'}`}>
                <p className="text-[10px] font-bold uppercase">Applied</p>
                <p className="text-xs font-semibold">{formatDate(job.dates?.appliedAt)}</p>
              </div>
              <div className={`p-3 rounded-xl border ${job.isInterviewing ? 'bg-secondary/5 border-secondary/20' : 'bg-base-200/50 border-transparent text-base-content/30'}`}>
                <p className="text-[10px] font-bold uppercase">Interview</p>
                <p className="text-xs font-semibold">{formatDate(job.dates?.interviewingAt)}</p>
              </div>
              <div className={`p-3 rounded-xl border ${job.isOffered ? 'bg-success/5 border-success/20' : 'bg-base-200/50 border-transparent text-base-content/30'}`}>
                <p className="text-[10px] font-bold uppercase">Offer</p>
                <p className="text-xs font-semibold">{formatDate(job.dates?.offerAt)}</p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/40 mb-2 flex items-center gap-2">
              <NotebookText size={16} /> Internal Notes
            </h3>
            <div className="bg-base-200/50 p-4 rounded-2xl text-sm text-base-content/80 min-h-[80px]">
              {job.notes || "No notes added yet for this application."}
            </div>
          </div>

          {/* Reminders Section */}
          {job.reminders && job.reminders.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/40 mb-3 flex items-center gap-2">
                <Bell size={16} /> Active Reminders
              </h3>
              <div className="space-y-2">
                {job.reminders.map(rem => (
                  <div key={rem._id} className="flex items-center justify-between bg-warning/10 border border-warning/20 p-3 rounded-xl text-xs font-medium">
                    <span className="capitalize">{rem.type} Reminder</span>
                    <span>Alert on: {new Date(rem.reminderDate).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-base-200 bg-base-200/30 flex justify-end">
          <button onClick={onClose} className="btn btn-primary px-10">Close Details</button>
        </div>
      </div>
    </div>
  );
};

export default ViewJobModal;