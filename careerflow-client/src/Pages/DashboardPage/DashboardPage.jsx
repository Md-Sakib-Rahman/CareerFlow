import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// FIXED: Added missing thunk imports
import {
  fetchMyBoards,
  fetchBoardJobs,
  deleteJob,
  moveToNextStage,
  moveToPreviousStage,
  rejectJobAction,
  updateBoardColumns,
} from "../../Redux/board/boardSlice";
import StatCards from "../../Components/Dashboard/StatCards/StatCards";
import LoadingSpinner from "../../Components/Shared/LoadingSpinner/LoadingSpinner";
import KanbanBoard from "../../Components/Dashboard/Kanban/KanbanBoard";
import AddJobModal from "../../Components/Dashboard/AddJobModal/AddJobModal";
import EditJobModal from "../../Components/Dashboard/EditJobModal/EditJobModal";
import ViewJobModal from "../../Components/Dashboard/ViewJobModal/ViewJobModal";
import SetReminderModal from "../../Components/Dashboard/SetReminderModal/SetReminderModal";
import AddColumnModal from "../../Components/Dashboard/AddColumnModal/AddColumnModal";
const DashboardPage = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { activeBoard, jobs, loading } = useSelector((state) => state.board);

  const handleCardAction = (type, job) => {
    setSelectedJob(job);

    switch (type) {
      case "next":
        dispatch(moveToNextStage({ job, columns: activeBoard.columns }));
        break;
      case "prev":
        dispatch(moveToPreviousStage({ job, columns: activeBoard.columns }));
        break;
      case "reject_quick":
        if (window.confirm(`Mark ${job.company} as Rejected?`)) {
          dispatch(rejectJobAction({ job, columns: activeBoard.columns }));
        }
        break;
      case "delete":
        if (
          window.confirm(
            `Are you sure? This will permanently delete ${job.title}.`,
          )
        ) {
          dispatch(deleteJob(job._id));
        }
        break;
      default:
        setActiveModal(type);
    }
  };
  const handleColumnUpdate = (updatedColumns) => {
    dispatch(
      updateBoardColumns({
        boardId: activeBoard._id,
        columns: updatedColumns,
      }),
    );
  };
  useEffect(() => {
    dispatch(fetchMyBoards());
  }, [dispatch]);

  useEffect(() => {
    if (activeBoard?._id) {
      dispatch(fetchBoardJobs(activeBoard._id));
    }
  }, [activeBoard, dispatch]);

  if (loading && !activeBoard) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content tracking-tight mb-2">
            Welcome back,{" "}
            <span className="text-primary">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-base-content/70">
            Here is what's happening with your{" "}
            <strong className="text-base-content">
              {activeBoard?.name || "Job Search"}
            </strong>
            .
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary shadow-lg shadow-primary/20"
        >
          + Add New Job
        </button>
      </div>

      <StatCards jobs={jobs} />

      <div className="flex-1 rounded-2xl bg-base-100/40 backdrop-blur-sm border border-base-300 p-2 md:p-4 overflow-visible flex flex-col">
        <div className="flex items-center justify-between px-2 pb-4 mb-2 border-b border-base-300">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Application Pipeline
          </h2>
          <button
            onClick={() => setIsColModalOpen(true)}
            className="btn btn-ghost btn-xs text-primary gap-1"
          >
            + Add Stage
          </button>
          <AddColumnModal
            isOpen={isColModalOpen}
            onClose={() => setIsColModalOpen(false)}
            activeBoard={activeBoard}
            onUpdateColumn={handleColumnUpdate}  
          />
        </div>

        <div className="flex-1 w-full overflow-x-auto overflow-y-visible custom-scrollbar pb-4">
          {activeBoard?.columns ? (
            <KanbanBoard
              columns={activeBoard.columns}
              initialJobs={jobs}
              onAction={handleCardAction}
              activeBoard={activeBoard}
              onUpdateColumn={handleColumnUpdate}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-base-content/50 border-2 border-dashed border-base-300 rounded-xl mt-4">
              <p>Loading board data...</p>
            </div>
          )}
        </div>
      </div>

      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeBoard={activeBoard}
      />

      {/* Render Modals based on activeModal state */}
      {/* View Modal */}
      {activeModal === "view" && (
        <ViewJobModal job={selectedJob} onClose={() => setActiveModal(null)} />
      )}

      {/* Edit Modal */}
      {activeModal === "edit" && (
        <EditJobModal job={selectedJob} onClose={() => setActiveModal(null)} />
      )}
      {/* reminder Modal */}
      {activeModal === "reminder" && (
        <SetReminderModal
          job={selectedJob}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchMyBoards, fetchBoardJobs, deleteJob, moveToNextStage } from "../../Redux/board/boardSlice";
// import StatCards from "../../Components/Dashboard/StatCards/StatCards";
// import LoadingSpinner from "../../Components/Shared/LoadingSpinner/LoadingSpinner";
// import KanbanBoard from "../../Components/Dashboard/Kanban/KanbanBoard";
// import AddJobModal from "../../Components/Dashboard/AddJobModal/AddJobModal";
// import { useState } from "react";

// const DashboardPage = () => {
//   const dispatch = useDispatch();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   // Pulling state from our newly created Redux slices
//   const { user } = useSelector((state) => state.auth);
//   const { activeBoard, jobs, loading } = useSelector((state) => state.board);

//   const [selectedJob, setSelectedJob] = useState(null);
//   const [activeModal, setActiveModal] = useState(null); // 'edit', 'view', 'delete', 'reminder'
//   const handleCardAction = (type, job) => {
//     setSelectedJob(job);

//     if (type === "next") {
//       dispatch(moveToNextStage({ job, columns: activeBoard.columns }));
//     } else if (type === "delete") {
//        // Simple confirm for now, or open a Modal
//        if(window.confirm(`Delete ${job.title} at ${job.company}?`)) {
//          dispatch(deleteJob(job._id));
//        }
//     } else {
//       setActiveModal(type);
//     }
//   };
//   // 1. Fetch the user's boards when the dashboard mounts
//   useEffect(() => {
//     dispatch(fetchMyBoards());
//   }, [dispatch]);

//   // 2. Whenever the activeBoard is set (e.g., the default one from registration), fetch its jobs
//   useEffect(() => {
//     if (activeBoard?._id) {
//       dispatch(fetchBoardJobs(activeBoard._id));
//     }
//   }, [activeBoard, dispatch]);

//   if (loading && !activeBoard) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col">

//       {/* Header Section */}
//       <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-base-content tracking-tight mb-2">
//             Welcome back, <span className="text-primary">{user?.name?.split(' ')[0]}</span> 👋
//           </h1>
//           <p className="text-base-content/70">
//             Here is what's happening with your <strong className="text-base-content">{activeBoard?.name || "Job Search"}</strong>.
//           </p>
//         </div>

//         {/* Optional: Add Job Button (Triggers a modal later) */}
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="btn btn-primary shadow-lg shadow-primary/20"
//         >
//           + Add New Job
//         </button>
//       </div>

//       {/* Analytics Summary */}
//       <StatCards jobs={jobs} />

//       {/* Kanban Board Area */}
//       <div className="flex-1 rounded-2xl bg-base-100/40 backdrop-blur-sm border border-base-300 p-2 md:p-4  overflow-y-visible flex flex-col ">
//         <div className="flex items-center justify-between px-2 pb-4 mb-2 border-b border-base-300 ">
//           <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
//             Application Pipeline
//           </h2>
//         </div>

//         {/* The Drag & Drop Context will go here */}
//         <div className="flex-1 w-full overflow-x-auto overflow-y-visible custom-scrollbar pb-4 ">
//           {/* <KanbanBoard columns={activeBoard?.columns} jobs={jobs} /> */}
//           <div className="h-64  max-sm:min-h-[600px] flex items-center justify-center text-base-content/50 overflow-y-visible rounded-xl mt-4">
//             {activeBoard?.columns ? (
//             <KanbanBoard columns={activeBoard.columns} initialJobs={jobs} onAction={handleCardAction}/>
//           ) : (
//             <div className="h-64 flex items-center justify-center text-base-content/50 border-2 border-dashed border-base-300 rounded-xl mt-4">
//               <p>Loading board data...</p>
//             </div>
//           )}
//           {activeModal === 'edit' && (
//         <EditJobModal job={selectedJob} onClose={() => setActiveModal(null)} />
//       )}
//           </div>
//         </div>

//       </div>
//       <AddJobModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         activeBoard={activeBoard}
//       />
//     </div>
//   );
// };

// export default DashboardPage;
