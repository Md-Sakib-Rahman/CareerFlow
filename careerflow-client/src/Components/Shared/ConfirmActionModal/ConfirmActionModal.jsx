import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearModal, moveToNextStage, deleteJob } from "../../../Redux/board/boardSlice";
import { AlertTriangle, Info, Trash2, ArrowRight } from "lucide-react";

const ConfirmActionModal = () => {
  const dispatch = useDispatch();
  const { selectedJob, modalConfig } = useSelector((state) => state.board.ui);
  const { activeBoard } = useSelector((state) => state.board);

  if (!modalConfig.title) return null;

  const handleConfirm = () => {
    // Dynamically execute the logic based on actionType
    switch (modalConfig.actionType) {
      case "MOVE_STAGE":
        dispatch(moveToNextStage({ job: selectedJob, columns: activeBoard.columns }));
        break;
      case "DELETE_JOB":
        dispatch(deleteJob(selectedJob._id));
        break;
      default:
        console.warn("No action handler defined for:", modalConfig.actionType);
    }
    dispatch(clearModal());
  };

  const getVariantStyles = () => {
    switch(modalConfig.variant) {
      case "error": return { bg: "bg-error/10", text: "text-error", btn: "btn-error shadow-error/20" };
      case "warning": return { bg: "bg-warning/10", text: "text-warning", btn: "btn-warning shadow-warning/20" };
      default: return { bg: "bg-primary/10", text: "text-primary", btn: "btn-primary shadow-primary/20" };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z- flex items-center justify-center bg-base-300/60 backdrop-blur-sm px-4">
      <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl border border-base-300 overflow-hidden">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 ${styles.bg} ${styles.text} rounded-full flex items-center justify-center mb-5`}>
            {modalConfig.variant === "error" ? <Trash2 size={30} /> : <AlertTriangle size={30} />}
          </div>

          <h3 className="text-xl font-bold text-base-content mb-2">{modalConfig.title}</h3>
          <p className="text-sm text-base-content/60 leading-relaxed mb-8">
            {modalConfig.description}
          </p>

          <div className="flex flex-col gap-3">
            <button onClick={handleConfirm} className={`btn ${styles.btn} w-full`}>
              {modalConfig.confirmText}
            </button>
            <button onClick={() => dispatch(clearModal())} className="btn btn-ghost w-full">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;