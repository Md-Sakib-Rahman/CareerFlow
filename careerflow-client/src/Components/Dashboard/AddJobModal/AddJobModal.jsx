import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createNewJob } from "../../../Redux/board/boardSlice";
import { X } from "lucide-react";

const AddJobModal = ({ isOpen, onClose, activeBoard }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    url: "",
  });

  if (!isOpen || !activeBoard) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Find the exact ID of the Wishlist column for the backend guardrail
    const wishlistColumn = activeBoard.columns.find(col => col.internalStatus === "wishlist");

    // 2. Package the data for our backend schema
    const newJobData = {
      boardId: activeBoard._id,
      columnId: wishlistColumn._id,
      company: formData.company,
      title: formData.title,
      url: formData.url,
      // You can expand this later with salary, deadline, notes, etc.
    };

    // 3. Dispatch the action
    await dispatch(createNewJob(newJobData));
    
    // 4. Cleanup and close
    setLoading(false);
    setFormData({ company: "", title: "", url: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm px-4">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-base-200 bg-base-200/50">
          <h3 className="font-bold text-lg text-base-content">Add New Job</h3>
          <button onClick={onClose} className="text-base-content/50 hover:text-error transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label text-xs font-bold text-base-content/70 uppercase">Company Name *</label>
            <input 
              type="text" 
              name="company"
              required 
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Google, Apple, Startup Inc." 
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors" 
            />
          </div>

          <div>
            <label className="label text-xs font-bold text-base-content/70 uppercase">Job Title *</label>
            <input 
              type="text" 
              name="title"
              required 
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Engineer" 
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors" 
            />
          </div>

          <div>
            <label className="label text-xs font-bold text-base-content/70 uppercase">Job Posting URL</label>
            <input 
              type="url" 
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://..." 
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-colors" 
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-2 border-t border-base-200 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn btn-ghost text-base-content/70">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Save Job"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddJobModal;