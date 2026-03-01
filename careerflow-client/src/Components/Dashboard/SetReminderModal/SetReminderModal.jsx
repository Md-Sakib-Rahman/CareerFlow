import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateJobDetails } from "../../../Redux/board/boardSlice";
import { X, Bell, Calendar as CalendarIcon, Clock } from "lucide-react";

const SetReminderModal = ({ job, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Default to 2 days before the event
  const [reminderData, setReminderData] = useState({
    targetDate: "",
    reminderLeadDays: 2,
  });

  if (!job) return null;

  const handleChange = (e) => {
    setReminderData({ ...reminderData, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   // We send this to our updateJobDetails thunk which hits the PATCH /api/jobs/:id
  //   // The backend logic we wrote handles creating/updating the Reminder collection.
  //   const payload = {
  //     dates: {
  //       actualInterviewDate: job.status === "interviewing" ? reminderData.targetDate : undefined,
  //       applyDeadlineAt: job.status === "wishlist" ? reminderData.targetDate : undefined,
  //     },
  //     reminderLeadDays: Number(reminderData.reminderLeadDays),
  //   };

  //   const result = await dispatch(updateJobDetails({ jobId: job._id, updates: payload }));
    
  //   if (updateJobDetails.fulfilled.match(result)) {
  //     onClose();
  //   }
  //   setLoading(false);
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Dynamic Payload Construction
    const payload = {
      dates: {
        // We always use actualInterviewDate as our primary 'reminder anchor' 
        // to simplify the API call; the backend re-maps it based on status.
        actualInterviewDate: reminderData.targetDate, 
      },
      reminderLeadDays: Number(reminderData.reminderLeadDays),
    };

    const result = await dispatch(updateJobDetails({ jobId: job._id, updates: payload }));
    
    if (updateJobDetails.fulfilled.match(result)) {
      onClose();
    }
    setLoading(false);
  };

 const getTargetLabel = () => {
    switch(job.status) {
      case "wishlist": return "Application Deadline";
      case "applied": return "First Interview Date";
      case "interviewing": return "Next Interview Round";
      default: return "Target Date";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm px-4">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-base-200 bg-warning/10">
          <div className="flex items-center gap-2 text-warning-content">
            <Bell size={20} className="text-warning" />
            <h3 className="font-bold text-lg">Set Alert</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm text-base-content/60">
            Set a reminder for <span className="font-bold text-base-content">{job.company}</span>. We'll notify you before the big day.
          </p>

          {/* Date Picker */}
          <div className="form-control">
            <label className="label text-xs font-bold text-base-content/60 uppercase">{getTargetLabel()}</label>
            <div className="relative">
              <CalendarIcon size={18} className="absolute left-3 top-3 text-base-content/30" />
              <input 
                type="date" 
                name="targetDate"
                required
                value={reminderData.targetDate}
                onChange={handleChange}
                className="input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100" 
              />
            </div>
          </div>

          {/* Lead Days Selector */}
          <div className="form-control">
            <label className="label text-xs font-bold text-base-content/60 uppercase">Remind me how many days before?</label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-3 text-base-content/30" />
              <select 
                name="reminderLeadDays"
                value={reminderData.reminderLeadDays}
                onChange={handleChange}
                className="select select-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100"
              >
                <option value={1}>1 Day Before</option>
                <option value={2}>2 Days Before (Recommended)</option>
                <option value={3}>3 Days Before</option>
                <option value={7}>1 Week Before</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-warning px-8 shadow-lg shadow-warning/20" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Enable Alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetReminderModal;