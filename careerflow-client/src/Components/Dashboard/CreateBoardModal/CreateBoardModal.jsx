import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createNewBoard } from "../../../Redux/board/boardSlice";
import { LayoutTemplate, X } from "lucide-react";

const CreateBoardModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    
    setIsCreating(true);
    const result = await dispatch(createNewBoard(newBoardName));
    
    if (createNewBoard.fulfilled.match(result)) {
      setNewBoardName("");
      onClose();
    }
    setIsCreating(false);
  };

  return (
    <div className="modal modal-open bg-base-300/60 backdrop-blur-sm z-">
      <div className="modal-box rounded-3xl border border-base-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <LayoutTemplate className="text-primary" /> New Board
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleCreateBoard}>
          <div className="form-control mb-6">
            <label className="label text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
              Board Name
            </label>
            <input 
              type="text" 
              placeholder="e.g., Spring 2026 Internships" 
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="input input-bordered w-full focus:border-primary bg-base-200/50" 
              required
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full shadow-lg shadow-primary/20"
            disabled={isCreating}
          >
            {isCreating ? <span className="loading loading-spinner"></span> : "Create Board"}
          </button>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default CreateBoardModal;