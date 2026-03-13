import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Save, Notebook } from 'lucide-react';
import { clearModal, updateJobNotes, updateJobDetails } from "../../../Redux/board/boardSlice";
import { toast } from 'react-toastify';

const NotePadModal = ({ job, onClose }) => {
  const dispatch = useDispatch();
  
  // if job prop is not provided, fallback to the job in Redux state
  const { selectedJob: reduxJob } = useSelector((state) => state.board.ui);
  const currentJob = job || reduxJob;

  const [notes, setNotes] = useState('');

  // modal open and show previous notes if they exist
  useEffect(() => {
    if (currentJob) {
      setNotes(currentJob.notes || '');
    }
  }, [currentJob]);

  const handleSave = async () => {
    if (!currentJob?._id) {
      toast.error('Job ID not found!');
      return;
    }

    try {
      // ১. redux state update (optimistic update)
      dispatch(updateJobNotes({ jobId: currentJob._id, notes }));

      // ২. database update
      await dispatch(updateJobDetails({ 
        jobId: currentJob._id, 
        updates: { notes } 
      })).unwrap();
      
      // modal close callback
      if (onClose) {
        onClose();
      } else {
        dispatch(clearModal());
      }
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  // if for some reason we don't have a job to display, we can return null or a fallback UI
  if (!currentJob) return null;

  return (
    <div className="fixed inset-0 !z-[9999] flex items-center justify-center bg-base-300/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl border border-base-300 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-base-200 bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Notebook size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">Notebook</h3>
              <p className="text-xs text-base-content/50 uppercase tracking-wider font-semibold truncate max-w-[250px]">
                {currentJob?.company} — {currentJob?.title}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose || (() => dispatch(clearModal()))}
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your interview experience or important notes here..."
            className="textarea textarea-bordered w-full h-64 p-4 bg-base-200/50 focus:bg-base-100 focus:border-primary text-base-content leading-relaxed transition-all resize-none outline-none"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-base-200 bg-base-200/50">
          <button
            onClick={onClose || (() => dispatch(clearModal()))}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary btn-sm px-6 shadow-lg shadow-primary/20"
          >
            <Save size={18} />
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotePadModal;