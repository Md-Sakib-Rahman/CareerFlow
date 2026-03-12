import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// 1. STRIPE IMPORTS: Routing hooks and toast for payment redirects
import { useSearchParams, useNavigate, useLocation } from "react-router"; 
import { toast } from "react-toastify";

// Actions
import { fetchMyBoards, fetchBoardJobs, clearModal, setActiveBoard } from "../../Redux/board/boardSlice";
import { fetchMe } from "../../Redux/auth/authSlice"; // Added to refresh Pro status after payment

// Components
import StatCards from "../../Components/Dashboard/StatCards/StatCards";
import LoadingSpinner from "../../Components/Shared/LoadingSpinner/LoadingSpinner";
import KanbanContainer from "../../Components/Dashboard/Kanban/KanbanContainer";

// Modals
import AddJobModal from "../../Components/Dashboard/AddJobModal/AddJobModal";
import EditJobModal from "../../Components/Dashboard/EditJobModal/EditJobModal";
import ViewJobModal from "../../Components/Dashboard/ViewJobModal/ViewJobModal";
import SetReminderModal from "../../Components/Dashboard/SetReminderModal/SetReminderModal";

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
    // 1. Always fetch fresh boards when Dashboard mounts
    dispatch(fetchMyBoards()).unwrap().then((response) => {
      const allBoards = response?.data || response || [];
      
      // 2. Find the primary board (or fallback to the first one)
      const primaryBoard = allBoards.find((b) => b.isPrimary === true) || allBoards[0];
      
      // 3. Force Redux to forget the last viewed board and switch to the primary one
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

  if (isInitializing || (loading && !activeBoard)) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content tracking-tight mb-2">
            Welcome back,{" "}
            {/* Fixed the split array render bug by adding [0] */}
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

      {/* The Kanban Container */}
      <KanbanContainer />

      {/* ==========================================
          GLOBAL MODALS (Controlled via Redux UI)
          ========================================== */}
      
      {/* 1. Add Job */}
      <AddJobModal 
        isOpen={isAddJobOpen} 
        onClose={() => setIsAddJobOpen(false)} 
        activeBoard={activeBoard} 
      />

      {/* 2. View Modal */}
      {activeModal === "view" && (
        <ViewJobModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}

      {/* 3. Edit Modal */}
      {activeModal === "edit" && (
        <EditJobModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}

      {/* 4. Reminder Modal */}
      {activeModal === "reminder" && (
        <SetReminderModal job={selectedJob} onClose={() => dispatch(clearModal())} />
      )}
    </div>
  );
};

export default DashboardPage;