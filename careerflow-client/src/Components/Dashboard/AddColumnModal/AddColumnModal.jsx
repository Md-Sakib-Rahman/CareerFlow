import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateBoardColumns } from "../../../Redux/board/boardSlice";
import { X, LayoutPanelLeft, ListOrdered } from "lucide-react";

const AddColumnModal = ({ isOpen, onClose, activeBoard }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  // Defaulting to interviewing since that's where most custom columns go
  const [formData, setFormData] = useState({ 
    title: "", 
    internalStatus: "interviewing",
    insertAfterId: "" 
  });

  // Set default "Insert After" to the last column when modal opens
  useEffect(() => {
    if (isOpen && activeBoard?.columns?.length > 0) {
      const lastColId = activeBoard.columns[activeBoard.columns.length - 1]._id;
      setFormData(prev => ({ ...prev, insertAfterId: lastColId }));
    }
  }, [isOpen, activeBoard]);

  if (!isOpen || !activeBoard) return null;

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

    // 1. Physically insert the object into the array
    // If findIndex fails (-1), it will prepend, otherwise it inserts after the selection
    existingCols.splice(insertIndex + 1, 0, newCol);

    // 2. Normalize Positions (0, 1, 2...)
    // This ensures that even with the new insertion, indexing is continuous
    const finalizedCols = existingCols.map((col, idx) => ({
      ...col,
      position: idx
    }));

    const result = await dispatch(updateBoardColumns({ 
      boardId: activeBoard._id, 
      columns: finalizedCols 
    }));

    if (updateBoardColumns.fulfilled.match(result)) {
      onClose();
      setFormData({ title: "", internalStatus: "interviewing", insertAfterId: "" });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm px-4">
      <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl border border-base-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-base-200 bg-base-200/50">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <LayoutPanelLeft size={20} className="text-primary" /> 
            Add Stage
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
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
// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { updateBoardColumns } from "../../../Redux/board/boardSlice";
// import { X, LayoutPanelLeft } from "lucide-react";

// const AddColumnModal = ({ isOpen, onClose, activeBoard }) => {
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({ title: "", internalStatus: "applied" });

//   if (!isOpen || !activeBoard) return null;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const newColumn = {
//       title: formData.title,
//       internalStatus: formData.internalStatus,
//       position: activeBoard.columns.length // Put it at the end
//     };

//     // Combine existing columns with the new one
//     const updatedColumns = [...activeBoard.columns, newColumn];

//     const result = await dispatch(updateBoardColumns({ 
//       boardId: activeBoard._id, 
//       columns: updatedColumns 
//     }));

//     if (updateBoardColumns.fulfilled.match(result)) {
//       onClose();
//       setFormData({ title: "", internalStatus: "applied" });
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm px-4">
//       <div className="bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl border border-base-300">
//         <div className="flex justify-between items-center p-5 border-b border-base-200">
//           <h3 className="font-bold text-lg flex items-center gap-2"><LayoutPanelLeft size={20} /> New Stage</h3>
//           <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><X size={20} /></button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-5 space-y-4">
//           <div className="form-control">
//             <label className="label text-xs font-bold text-base-content/60 uppercase">Column Name</label>
//             <input 
//               type="text" required value={formData.title} 
//               onChange={(e) => setFormData({...formData, title: e.target.value})}
//               placeholder="e.g., Technical Assessment" className="input input-bordered w-full bg-base-200/50" 
//             />
//           </div>

//           <div className="form-control">
//             <label className="label text-xs font-bold text-base-content/60 uppercase">Treat as Type</label>
//             <select 
//               value={formData.internalStatus}
//               onChange={(e) => setFormData({...formData, internalStatus: e.target.value})}
//               className="select select-bordered w-full bg-base-200/50"
//             >
//               <option value="wishlist">Wishlist</option>
//               <option value="applied">Applied</option>
//               <option value="interviewing">Interviewing</option>
//               <option value="offer">Offer</option>
//               <option value="rejected">Rejected</option>
//             </select>
//             <label className="label"><span className="label-text-alt text-base-content/40 italic">This controls automated reminders.</span></label>
//           </div>

//           <button type="submit" className="btn btn-primary w-full" disabled={loading}>
//             {loading ? <span className="loading loading-spinner"></span> : "Add Column"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddColumnModal;