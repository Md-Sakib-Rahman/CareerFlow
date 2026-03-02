import React from "react";
import { useDispatch } from "react-redux";
import { deleteBoardAction, setPrimaryBoardAction } from "../../../Redux/board/boardSlice";
import { LayoutTemplate, Trash2, Columns, Star } from "lucide-react";

const BoardCard = ({ board, onOpen }) => {
  const dispatch = useDispatch();

  const handleDelete = (e) => {
    e.stopPropagation(); 
    if (window.confirm(`Are you sure you want to permanently delete "${board.name}" and all its jobs?`)) {
      dispatch(deleteBoardAction(board._id));
    }
  };

  const handleSetPrimary = (e) => {
    e.stopPropagation(); 
    if (!board.isPrimary) {
      dispatch(setPrimaryBoardAction(board._id));
    }
  };

  return (
    <div 
      onClick={() => onOpen(board)}
      className="bg-base-100 border border-base-300 rounded-2xl p-6 cursor-pointer hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${board.isPrimary ? "bg-primary" : "bg-primary/50 group-hover:bg-primary"}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-base-200 rounded-xl group-hover:bg-primary/10 transition-colors">
          <LayoutTemplate size={24} className="text-base-content/70 group-hover:text-primary transition-colors" />
        </div>
        
        {/* Action Buttons Container */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          
          {/* 1. Primary Star Button */}
          <button 
            onClick={handleSetPrimary}
            className={`btn btn-ghost btn-xs btn-circle transition-colors ${
              board.isPrimary 
                ? "text-warning hover:bg-warning/20 opacity-100" // Always visible if it IS primary
                : "text-base-content/30 hover:text-warning hover:bg-warning/20"
            }`}
            title={board.isPrimary ? "Primary Board" : "Set as Primary"}
          >
            <Star 
              size={16} 
              className={board.isPrimary ? "fill-warning text-warning" : ""} 
            />
          </button>

          {/* 2. Delete Button */}
          <button 
            onClick={handleDelete}
            className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:bg-error/20 hover:text-error transition-colors"
            title="Delete Board"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold text-base-content group-hover:text-primary transition-colors truncate">
          {board.name}
        </h2>
        {/* Mobile-friendly indicator when not hovering */}
        {board.isPrimary && (
          <span className="badge badge-warning badge-xs md:hidden">Primary</span>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-base-content/60 font-medium mt-4">
        <Columns size={16} />
        <span>{board.columns?.length || 0} Stages</span>
      </div>
    </div>
  );
};

export default BoardCard;
// import React from "react";
// import { useDispatch } from "react-redux";
// import { deleteBoardAction } from "../../../Redux/board/boardSlice";
// import { LayoutTemplate, Trash2, Columns } from "lucide-react";

// const BoardCard = ({ board, onOpen }) => {
//   const dispatch = useDispatch();

//   const handleDelete = (e) => {
//     e.stopPropagation(); // Prevents the card click from firing
//     if (window.confirm(`Are you sure you want to permanently delete "${board.name}" and all its jobs?`)) {
//       dispatch(deleteBoardAction(board._id));
//     }
//   };

//   return (
//     <div 
//       onClick={() => onOpen(board)}
//       className="bg-base-100 border border-base-300 rounded-2xl p-6 cursor-pointer hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
//     >
//       <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
      
//       <div className="flex justify-between items-start mb-4">
//         <div className="p-3 bg-base-200 rounded-xl group-hover:bg-primary/10 transition-colors">
//           <LayoutTemplate size={24} className="text-base-content/70 group-hover:text-primary transition-colors" />
//         </div>
//         <button 
//           onClick={handleDelete}
//           className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:bg-error/20 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
//           title="Delete Board"
//         >
//           <Trash2 size={16} />
//         </button>
//       </div>

//       <h2 className="text-xl font-bold text-base-content mb-1 group-hover:text-primary transition-colors">
//         {board.name}
//       </h2>
      
//       <div className="flex items-center gap-2 text-sm text-base-content/60 font-medium mt-4">
//         <Columns size={16} />
//         <span>{board.columns?.length || 0} Stages</span>
//       </div>
//     </div>
//   );
// };

// export default BoardCard;