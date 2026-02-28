import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../../../Redux/board/boardSlice";
import KanbanBoard from "./KanbanBoard";
import AddColumnModal from "../AddColumnModal/AddColumnModal";

const KanbanContainer = () => {
  const dispatch = useDispatch();
  const { activeBoard, loading } = useSelector((state) => state.board);
  const { activeModal } = useSelector((state) => state.board.ui);
  if (loading && !activeBoard) return <div className="p-10 text-center">Loading Board...</div>;

  return (
    <div className="flex-1 rounded-2xl bg-base-100/40 backdrop-blur-sm border border-base-300 p-2 md:p-4 overflow-visible flex flex-col">
      {/* Header Area */}
      <div className="flex items-center justify-between px-2 pb-4 mb-2 border-b border-base-300">
        <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Application Pipeline
        </h2>
        <button
          onClick={() => dispatch(setModal({ modal: "addColumn" }))}
          className="btn btn-ghost btn-xs text-primary gap-1"
        >
          + Add Stage
        </button>
      </div>

      {/* Board Area */}
      <div className="flex-1 w-full overflow-x-auto overflow-y-visible custom-scrollbar pb-4">
        {activeBoard?.columns ? (
          <KanbanBoard />
        ) : (
          <div className="h-64 flex items-center justify-center text-base-content/50 border-2 border-dashed border-base-300 rounded-xl mt-4">
            <p>No stages found in this board.</p>
          </div>
        )}
      </div>

      {/* Scoped Modals */}
      {activeModal === "addColumn" && (
        <AddColumnModal />
      )}
    </div>
  );
};

export default KanbanContainer;