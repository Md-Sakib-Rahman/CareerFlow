import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

//  STRIPE IMPORTS: Routing hooks and toast for payment redirects
import { useSearchParams, useNavigate, useLocation } from "react-router"; 
import { toast } from "react-toastify";

// Actions
import { fetchMyBoards, fetchBoardJobs, clearModal, setActiveBoard } from "../../Redux/board/boardSlice";
import { fetchMe } from "../../Redux/auth/authSlice";  

// Components
import StatCards from "../../Components/Dashboard/StatCards/StatCards";
import KanbanContainer from "../../Components/Dashboard/Kanban/KanbanContainer";

// Modals
import AddJobModal from "../../Components/Dashboard/AddJobModal/AddJobModal";
import EditJobModal from "../../Components/Dashboard/EditJobModal/EditJobModal";
import ViewJobModal from "../../Components/Dashboard/ViewJobModal/ViewJobModal";
import SetReminderModal from "../../Components/Dashboard/SetReminderModal/SetReminderModal";
import NotePadModal from "../../Components/Dashboard/NotePadModal/NotePadModal"; 

const KanbanSkeleton = () => (
  <div className="flex gap-4 h-full w-full overflow-hidden opacity-60 mt-6">
    {[1, 2, 3, 4].map((col) => (
      <div key={col} className="w-80 flex-shrink-0 bg-base-200/50 rounded-2xl p-4 flex flex-col gap-3">
        {/* Column Header Skeleton */}
        <div className="h-6 w-32 bg-base-300 animate-pulse rounded-md mb-2"></div>
        {/* Job Card Skeletons */}
        {[1, 2, 3].map((card) => (
          <div key={card} className="h-28 w-full bg-base-100 animate-pulse rounded-xl border border-base-300"></div>
        ))}
      </div>
    ))}
  </div>
);

const DashboardPage = () => {
  const dispatch = useDispatch();
  
  // STRIPE: Initialize router hooks
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // SELECTORS: Pull only what we need for the layout and initialization
  const { user } = useSelector((state) => state.auth);
  const { activeBoard, loading } = useSelector((state) => state.board);
  const { activeModal, selectedJob } = useSelector((state) => state.board.ui);

  // Local state only for the "Add New Job" trigger and initialization
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ==========================================
  // STRIPE PAYMENT REDIRECT LISTENER
  // ==========================================
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");

    if (paymentStatus === "success") {
      toast.success("Payment successful! Your account has been upgraded. 🎉");
      dispatch(fetchMe()); // Instantly update Redux with new plan
      navigate(location.pathname, { replace: true }); // Wipe '?payment=success' from URL
    } else if (paymentStatus === "cancelled") {
      toast.warning("Payment was cancelled. Your plan has not been changed.");
      navigate(location.pathname, { replace: true }); // Wipe '?payment=cancelled' from URL
    }
  }, [searchParams, navigate, location, dispatch]);

  // ==========================================
  // DATA INITIALIZATION
  // ==========================================
  useEffect(() => {
    setIsInitializing(true);
    //  Always fetch fresh boards when Dashboard mounts
    dispatch(fetchMyBoards()).unwrap().then((response) => {
      const allBoards = response?.data || response || [];
      
      //  Find the primary board (or fallback to the first one)
      const primaryBoard = allBoards.find((b) => b.isPrimary === true) || allBoards[0];
      
      //  Force Redux to forget the last viewed board and switch to the primary one
      if (primaryBoard) {
        dispatch(setActiveBoard(primaryBoard));
      }
      setIsInitializing(false);
    }).catch(() => {
      setIsInitializing(false);
    });
  }, [dispatch]);

  useEffect(() => {
    if (activeBoard && activeBoard._id) {
      dispatch(fetchBoardJobs(activeBoard._id));
    }
  }, [activeBoard, dispatch]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content tracking-tight mb-2">
            Welcome back,{" "}
            <span className="text-primary">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-base-content/70">
            Managing search: <strong className="text-base-content">{activeBoard?.name || "Loading..."}</strong>
          </p>
        </div>
        <button
          onClick={() => setIsAddJobOpen(true)}
          className="btn btn-primary shadow-lg shadow-primary/20"
        >
          + Add New Job
        </button>
      </div>

      {/* Analytics Summary */}
      <StatCards />

      {isInitializing || (loading && !activeBoard?.columns) ? (
        <KanbanSkeleton />
      ) : (
        <KanbanContainer />
      )}

      {/* ==========================================
          GLOBAL MODALS (Controlled via Redux UI)
          ========================================== */}
      
      {/* Add Job */}
      <AddJobModal 
        isOpen={isAddJobOpen} 
        onClose={() => setIsAddJobOpen(false)} 
        activeBoard={activeBoard} 
      />

      {/*  View Modal */}
      {activeModal === "view" && (
        <ViewJobModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}

      {/* Edit Modal */}
      {activeModal === "edit" && (
        <EditJobModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}

      {/*  Reminder Modal */}
      {activeModal === "reminder" && (
        <SetReminderModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}
      {/* Note Pad Modal */}
      {activeModal === "notePad" && (
        <NotePadModal 
          job={selectedJob} 
          onClose={() => dispatch(clearModal())} 
        />
      )}
    </div>
  );
};

export default DashboardPage;
