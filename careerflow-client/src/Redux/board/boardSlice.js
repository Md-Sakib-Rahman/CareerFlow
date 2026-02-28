import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { privateApi } from "../../Axios/axiosInstance";

// ==========================================
// THUNKS
// ==========================================

export const fetchMyBoards = createAsyncThunk(
  "board/fetchMyBoards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await privateApi.get("/api/boards");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch boards",
      );
    }
  },
);

export const fetchBoardJobs = createAsyncThunk(
  "board/fetchBoardJobs",
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await privateApi.get(`/api/jobs/board/${boardId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch jobs",
      );
    }
  },
);

export const updateJobColumn = createAsyncThunk(
  "board/updateJobColumn",
  async ({ jobId, columnId, status }, { rejectWithValue }) => {
    try {
      const response = await privateApi.patch(`/api/jobs/${jobId}`, {
        columnId,
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to move job",
      );
    }
  },
);

export const createNewJob = createAsyncThunk(
  "board/createNewJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await privateApi.post("/api/jobs", jobData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create job",
      );
    }
  },
);

export const deleteJob = createAsyncThunk(
  "board/deleteJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await privateApi.delete(`/api/jobs/${jobId}`);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  },
);

export const updateJobDetails = createAsyncThunk(
  "board/updateJobDetails",
  async ({ jobId, updates }, { rejectWithValue }) => {
    try {
      const response = await privateApi.patch(`/api/jobs/${jobId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

export const moveToNextStage = createAsyncThunk(
  "board/moveToNextStage",
  async ({ job, columns }, { dispatch, rejectWithValue }) => {
    const currentIndex = columns.findIndex((col) => col._id === job.columnId);
    const nextColumn = columns[currentIndex + 1];
    if (!nextColumn) return rejectWithValue("Already at final stage");

    return dispatch(
      updateJobColumn({
        jobId: job._id,
        columnId: nextColumn._id,
        status: nextColumn.internalStatus,
      }),
    ).unwrap();
  },
);

export const moveToPreviousStage = createAsyncThunk(
  "board/moveToPreviousStage",
  async ({ job, columns }, { dispatch, rejectWithValue }) => {
    const currentIndex = columns.findIndex((col) => col._id === job.columnId);
    const prevColumn = columns[currentIndex - 1];
    if (!prevColumn) return rejectWithValue("Already at the beginning");

    return dispatch(
      updateJobColumn({
        jobId: job._id,
        columnId: prevColumn._id,
        status: prevColumn.internalStatus,
      }),
    ).unwrap();
  },
);

export const rejectJobAction = createAsyncThunk(
  "board/rejectJobAction",
  async ({ job, columns }, { dispatch, rejectWithValue }) => {
    const rejectedColumn = columns.find(
      (col) => col.internalStatus === "rejected",
    );
    if (!rejectedColumn) return rejectWithValue("Rejected column not found");

    return dispatch(
      updateJobColumn({
        jobId: job._id,
        columnId: rejectedColumn._id,
        status: "rejected",
      }),
    ).unwrap();
  },
);

export const updateBoardColumns = createAsyncThunk(
  "board/updateBoardColumns",
  async ({ boardId, columns }, { rejectWithValue }) => {
    try {
      const response = await privateApi.patch(
        `/api/boards/${boardId}/columns`,
        { columns },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update columns",
      );
    }
  },
);

// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  boards: [],
  activeBoard: null,
  jobs: [],
  loading: false,
  error: null,
  ui: {
    selectedJob: null,
    activeModal: null, // 'view', 'edit', 'reminder', 'addColumn', 'confirmAction'
    modalConfig: {
      title: "",
      description: "",
      confirmText: "",
      actionType: null,
      variant: "primary", // 'primary', 'error', 'warning'
    },
  },
};

// ==========================================
// SLICE
// ==========================================

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setActiveBoard: (state, action) => {
      state.activeBoard = action.payload;
    },
    setModal: (state, action) => {
      state.ui.activeModal = action.payload.modal;
      state.ui.selectedJob = action.payload.job || null;
    },
    openConfirmModal: (state, action) => {
      state.ui.activeModal = "confirmAction";
      state.ui.selectedJob = action.payload.job || null;
      state.ui.modalConfig = {
        title: action.payload.title,
        description: action.payload.description,
        confirmText: action.payload.confirmText,
        actionType: action.payload.actionType,
        variant: action.payload.variant || "primary",
      };
    },
    clearModal: (state) => {
      state.ui.activeModal = null;
      state.ui.selectedJob = null;
      state.ui.modalConfig = initialState.ui.modalConfig;
    },
    clearBoardState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // 1. Fetch Boards
      .addCase(fetchMyBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBoards.fulfilled, (state, action) => {
        state.loading = false;
        const boardsData = action.payload?.data || action.payload || [];
        state.boards = Array.isArray(boardsData) ? boardsData : [];
        
        // ACCURACY CHECK: Assign the first object, not the array
        if (!state.activeBoard && state.boards.length > 0) {
          state.activeBoard = state.boards.at(0); 
        }
      })
      .addCase(fetchMyBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 2. Fetch Jobs
      .addCase(fetchBoardJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Notice: No action.payload reading here!
      })
      .addCase(fetchBoardJobs.fulfilled, (state, action) => {
        state.loading = false;
        // Safely extract data ONLY when fulfilled
        const jobsData = action.payload?.data || action.payload || [];
        state.jobs = Array.isArray(jobsData) ? jobsData : [];
      })
      .addCase(fetchBoardJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 3. Update Job (Column or Details)
      .addCase(updateJobColumn.fulfilled, (state, action) => {
        const updatedJob = action.payload?.data || action.payload;
        if (updatedJob && updatedJob._id) {
          const index = state.jobs.findIndex((j) => j._id === updatedJob._id);
          if (index !== -1) state.jobs[index] = updatedJob;
        }
      })
      .addCase(updateJobDetails.fulfilled, (state, action) => {
        const updatedJob = action.payload?.data || action.payload;
        if (updatedJob && updatedJob._id) {
          const index = state.jobs.findIndex((j) => j._id === updatedJob._id);
          if (index !== -1) state.jobs[index] = updatedJob;
        }
      })

      // 4. Create & Delete
      .addCase(createNewJob.fulfilled, (state, action) => {
        const newJob = action.payload?.data || action.payload;
        if (newJob) state.jobs.push(newJob);
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j._id !== action.payload);
      })

      // 5. Update Board Columns
      .addCase(updateBoardColumns.fulfilled, (state, action) => {
        state.activeBoard = action.payload?.data || action.payload;
        state.loading = false;
      });
  },
});

export const {
  setActiveBoard,
  setModal,
  openConfirmModal,
  clearModal,
  clearBoardState,
} = boardSlice.actions;

export default boardSlice.reducer;
