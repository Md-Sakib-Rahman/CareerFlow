import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Search, Filter, DollarSign } from "lucide-react";

// Redux Actions
import {
  fetchAllUserJobs, // <-- Changed to fetch the universal jobs
  clearModal,
} from "../../Redux/board/boardSlice";

// Components (Make sure these paths match your folder structure!)
import StaticJobCard from "../../Components/Dashboard/StaticJobCard/StaticJobCard";
import ViewJobModal from "../../Components/Dashboard/ViewJobModal/ViewJobModal";
import EditJobModal from "../../Components/Dashboard/EditJobModal/EditJobModal";
import NotePadModal from "../../Components/Dashboard/NotePadModal/NotePadModal";

const ApplicationsPage = () => {
  const dispatch = useDispatch();

  // 1. Pull ALL JOBS and ui state from Redux (no longer tied to activeBoard)
  const { allJobs, ui } = useSelector((state) => state.board);
  const activeModal = ui?.activeModal;

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minSalary, setMinSalary] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // ==========================================
  // 2. DATA FETCHING (Universal Jobs)
  // ==========================================
  useEffect(() => {
    // Simply fetch every job belonging to the user on mount
    dispatch(fetchAllUserJobs());
  }, [dispatch]);

  // Reset to page 1 when any filter changes
  useMemo(() => setCurrentPage(1), [searchTerm, statusFilter, minSalary]);

  // ==========================================
  // 3. FILTERING LOGIC
  // ==========================================
  const filteredJobs = useMemo(() => {
    return allJobs // <-- Now filtering over allJobs instead of jobs
      .filter((job) => {
        // Search Match
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower);

        // Status Match
        const matchesStatus =
          statusFilter === "all" || job.status === statusFilter;

        // Salary Match
        let matchesSalary = true;
        if (minSalary !== "") {
          const threshold = Number(minSalary);
          const jMin = job.salary?.min ? Number(job.salary.min) : 0;

          if (jMin === 0) {
            matchesSalary = false;
          } else {
            matchesSalary = jMin >= threshold;
          }
        }

        return matchesSearch && matchesStatus && matchesSalary;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allJobs, searchTerm, statusFilter, minSalary]); // <-- Added allJobs to dependencies

  // Pagination Logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMinSalary("");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-full min-h-[calc(100vh-4rem)]">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-base-content">
            All Applications
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Tracking {filteredJobs.length}{" "}
            {filteredJobs.length === 1 ? "job" : "jobs"} across your pipeline
          </p>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-wrap max-sm:flex-col items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-56 max-sm:w-full">
            <Search
              size={16}
              className="absolute left-3 top-3 text-base-content/40"
            />
            <input
              type="text"
              placeholder="Search company or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm h-10 w-full pl-9 bg-base-100 border-base-300 focus:border-primary rounded-xl"
            />
          </div>

          {/* Status Filter */}
          <div className="relative max-sm:w-full">
            <Filter
              size={14}
              className="absolute left-3 top-3.5 text-base-content/40 pointer-events-none max-sm:w-full"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-sm h-10 pl-8 pr-8 bg-base-100 border-base-300 focus:border-primary rounded-xl max-sm:w-full"
            >
              <option value="all">All Stages</option>
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Single Minimum Salary Filter */}
          <div className="relative max-sm:w-full">
            <DollarSign
              size={14}
              className="absolute left-3 top-3.5 text-base-content/40 pointer-events-none max-sm:w-full"
            />
            <input
              type="number"
              placeholder="Min Salary..."
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="input input-sm h-10 pl-8 w-32 md:w-40 bg-base-100 border-base-300 focus:border-primary rounded-xl max-sm:w-full"
            />
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {currentJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentJobs.map((job) => (
            <StaticJobCard key={job._id} job={job} dispatch={dispatch} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-base-300 rounded-3xl bg-base-100/50">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
            <Search size={24} className="text-base-content/30" />
          </div>
          <h3 className="font-bold text-lg text-base-content">
            No applications found
          </h3>
          <p className="text-base-content/60 max-w-sm mt-2">
            Try adjusting your search terms or clearing your filters to see more
            results.
          </p>
          {(searchTerm !== "" ||
            statusFilter !== "all" ||
            minSalary !== "") && (
            <button
              onClick={handleClearFilters}
              className="btn btn-primary btn-sm mt-6"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-auto pb-4">
          <div className="join bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <button
              className="join-item btn btn-sm border-0 hover:bg-base-200"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              «
            </button>
            <button className="join-item btn btn-sm border-0 no-animation bg-base-100 font-bold w-32 cursor-default pointer-events-none">
              Page {currentPage} of {totalPages}
            </button>
            <button
              className="join-item btn btn-sm border-0 hover:bg-base-200"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 4. MODAL MOUNTING AREA                       */}
      {/* ========================================== */}
      {activeModal === "view" && (
        <ViewJobModal job={ui.selectedJob} onClose={() => dispatch(clearModal())} />
      )}
    </div>
  );
};

export default ApplicationsPage;
