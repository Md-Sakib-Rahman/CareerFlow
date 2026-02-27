import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createNewJob } from "../../../Redux/board/boardSlice";
import { X, Briefcase, DollarSign, MapPin, Link as LinkIcon } from "lucide-react";

const AddJobModal = ({ isOpen, onClose, activeBoard }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    url: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
  });

  if (!isOpen || !activeBoard) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Find the exact ID of the Wishlist column
    const wishlistColumn = activeBoard.columns.find(col => col.internalStatus === "wishlist");

    // 2. Package the data for our nested backend schema
    const newJobData = {
      boardId: activeBoard._id,
      columnId: wishlistColumn._id,
      company: formData.company,
      title: formData.title,
      url: formData.url,
      location: formData.location,
      salary: {
        min: Number(formData.salaryMin) || 0,
        max: Number(formData.salaryMax) || 0,
        currency: formData.currency
      }
    };

    // 3. Dispatch the action
    const result = await dispatch(createNewJob(newJobData));
    
    // 4. Cleanup and close if successful
    if (createNewJob.fulfilled.match(result)) {
      setFormData({
        company: "",
        title: "",
        url: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
      });
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm px-4">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl border border-base-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-base-200 bg-base-200/50">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Briefcase size={20} />
            </div>
            <h3 className="font-bold text-lg text-base-content">Add New Job</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Company & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label text-xs font-bold text-base-content/60 uppercase">Company *</label>
              <input 
                type="text" name="company" required value={formData.company} onChange={handleChange}
                placeholder="Google" className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" 
              />
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold text-base-content/60 uppercase">Job Title *</label>
              <input 
                type="text" name="title" required value={formData.title} onChange={handleChange}
                placeholder="Software Engineer" className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" 
              />
            </div>
          </div>

          {/* Location & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label text-xs font-bold text-base-content/60 uppercase">Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3.5 text-base-content/30" />
                <input 
                  type="text" name="location" value={formData.location} onChange={handleChange}
                  placeholder="Ottawa (Remote)" className="input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100" 
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold text-base-content/60 uppercase">Job URL</label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-3.5 text-base-content/30" />
                <input 
                  type="url" name="url" value={formData.url} onChange={handleChange}
                  placeholder="https://linkedin.com/..." className="input input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-100" 
                />
              </div>
            </div>
          </div>

          {/* Salary Section */}
          <div className="form-control">
            <label className="label text-xs font-bold text-base-content/60 uppercase">Salary Range</label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-3 text-base-content/40 text-sm">$</span>
                <input 
                  type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange}
                  placeholder="Min" className="input input-bordered w-full pl-7 bg-base-200/50 focus:bg-base-100" 
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3 text-base-content/40 text-sm">$</span>
                <input 
                  type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange}
                  placeholder="Max" className="input input-bordered w-full pl-7 bg-base-200/50 focus:bg-base-100" 
                />
              </div>
              <select 
                name="currency" value={formData.currency} onChange={handleChange}
                className="select select-bordered bg-base-200/50 focus:bg-base-100 font-semibold"
              >
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
                <option value="EUR">EUR</option>
                <option value="BDT">BDT</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-6 mt-2 border-t border-base-200 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn btn-ghost text-base-content/70">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-8 shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Save Job"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddJobModal;