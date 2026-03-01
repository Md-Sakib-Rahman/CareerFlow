import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateJobDetails } from "../../../Redux/board/boardSlice";
import { X, Save } from "lucide-react";

const EditJobModal = ({ job, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    title: "",
    url: "",
    location: "",
    salaryMin: 0, // Changed from salary string
    salaryMax: 0, // Changed from salary string
    currency: "USD",
  });

  // Sync internal state with the job prop when it opens
  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company || "",
        title: job.title || "",
        url: job.url || "",
        location: job.location || "",
        salaryMin: job.salary?.min || 0,
        salaryMax: job.salary?.max || 0,
        currency: job.salary?.currency || "USD",
      });
    }
  }, [job]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      salary: {
        min: Number(formData.salaryMin),
        max: Number(formData.salaryMax),
        currency: formData.currency,
      },
    };

    // Remove the flat fields before sending to backend
    delete payload.salaryMin;
    delete payload.salaryMax;
    delete payload.currency;

    const result = await dispatch(
      updateJobDetails({ jobId: job._id, updates: payload }),
    );
    if (updateJobDetails.fulfilled.match(result)) onClose();
    setLoading(false);
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm px-4">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl border border-base-300 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-base-200 bg-base-200/50">
          <div>
            <h3 className="font-bold text-lg text-base-content">
              Edit Opportunity
            </h3>
            <p className="text-xs text-base-content/50 uppercase tracking-wider font-semibold">
              Ref: {job._id.slice(-6)}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label text-xs font-bold text-base-content/60 uppercase">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100"
              />
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold text-base-content/60 uppercase">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input input-bordered w-full bg-base-200/50 focus:bg-base-100"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold text-base-content/60 uppercase">
              Job Posting URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://..."
              className="input input-bordered w-full bg-base-200/50 focus:bg-base-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="form-control">
              <label className="label text-xs font-bold text-base-content/60 uppercase">
                Min Salary
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200/50"
              />
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold text-base-content/60 uppercase">
                Max Salary
              </label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200/50"
              />
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold text-base-content/60 uppercase">
                Curr.
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="select select-bordered bg-base-200/50"
              >
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
                <option value="EUR">EUR</option>
                <option value="BDT">BDT</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-base-200 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-8 shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;
