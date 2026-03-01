import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// Import clearModal to close the modal
import { updateBoardColumns, clearModal } from "../../../Redux/board/boardSlice"; 
import { X, LayoutPanelLeft, ListOrdered } from "lucide-react";

// REMOVED PROPS: We will get everything from Redux now
const AddColumnModal = () => {
  const dispatch = useDispatch();
  
  // 1. Fetch activeBoard directly from Redux
  const { activeBoard } = useSelector((state) => state.board);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    title: "", 
    internalStatus: "interviewing",
    insertAfterId: "" 
  });

  // 2. Set default "Insert After" to the last column when modal mounts
  useEffect(() => {
    if (activeBoard?.columns?.length > 0) {
      const lastColId = activeBoard.columns[activeBoard.columns.length - 1]._id;
      setFormData(prev => ({ ...prev, insertAfterId: lastColId }));
    }
  }, [activeBoard]);

  // Fallback if board isn't loaded yet
  if (!activeBoard) return null;

  // 3. New Close Handler
  const handleClose = () => {
    dispatch(clearModal());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const existingCols = [...activeBoard.columns];
    
    // Find where to insert the new column
    const insertIndex = existingCols.findIndex(c => c._id === formData.insertAfterId);
    
    const newCol = {
      title: formData.title,
      internalStatus: formData.internalStatus,
    };

    // Physically insert the object into the array
    existingCols.splice(insertIndex + 1, 0, newCol);

    // Normalize Positions (0, 1, 2...)
    const finalizedCols = existingCols.map((col, idx) => ({
      ...col,
      position: idx
    }));

    const result = await dispatch(updateBoardColumns({ 
      boardId: activeBoard._id, 
      columns: finalizedCols 
    }));

    if (updateBoardColumns.fulfilled.match(result)) {
      handleClose(); // Close via Redux
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z- flex items-center justify-center bg-base-300/60 backdrop-blur-sm px-4">
      <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl border border-base-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-base-200 bg-base-200/50">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <LayoutPanelLeft size={20} className="text-primary" /> 
            Add Stage
          </h3>
          {/* Trigger Redux close handler */}
          <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Column Name */}
          <div className="form-control">
            <label className="label text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
              Stage Name
            </label>
            <input 
              type="text" 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Technical Interview" 
              className="input input-bordered w-full bg-base-200/50 focus:border-primary" 
            />
          </div>

          {/* Placement Logic */}
          <div className="form-control">
            <label className="label text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
              Insert After
            </label>
            <div className="relative">
              <ListOrdered size={16} className="absolute left-3 top-3.5 text-base-content/30" />
              <select 
                value={formData.insertAfterId}
                onChange={(e) => setFormData({...formData, insertAfterId: e.target.value})}
                className="select select-bordered w-full pl-10 bg-base-200/50"
              >
                {activeBoard.columns.map(col => (
                  <option key={col._id} value={col._id}>
                    After: {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Internal Type */}
          <div className="form-control">
            <label className="label text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
              Category (Reminders Type)
            </label>
            <select 
              value={formData.internalStatus}
              onChange={(e) => setFormData({...formData, internalStatus: e.target.value})}
              className="select select-bordered w-full bg-base-200/50"
            >
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button type="submit" className="btn btn-primary w-full shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : "Create Stage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddColumnModal;