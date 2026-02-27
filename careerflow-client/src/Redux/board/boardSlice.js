import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { privateApi } from "../../Axios/axiosInstance";

// ==========================================
// THUNKS
// ==========================================

// 1. Fetch all boards belonging to the logged-in user
export const fetchMyBoards = createAsyncThunk(
  "board/fetchMyBoards",
  async (_, { rejectWithValue }) => {
    try {
      // Assuming your route is GET /api/boards
      const response = await privateApi.get("/api/boards");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch boards",
      );
    }
  },
);

// 2. Fetch all jobs for a specific board
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
// 3. Update a job's column/status after drag-and-drop
export const updateJobColumn = createAsyncThunk(
  "board/updateJobColumn",
  async ({ jobId, columnId, status }, { rejectWithValue }) => {
    try {
      // Calls the PATCH /api/jobs/:id endpoint we built earlier
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

// 4. Create a new job
export const createNewJob = createAsyncThunk(
  "board/createNewJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await privateApi.post("/api/jobs", jobData);
      return response.data; // The backend returns the newly created job
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
// 5. Update general job details (Metadata)
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
// MOVE to next stage (logic-based)
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
// MOVE to previous stage
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

// QUICK REJECT
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
        {
          columns,
        },
      );
      return response.data; // Should return the updated board object
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
  boards: [], // Array of user's boards
  activeBoard: null, // The currently selected board (useful if they have multiple)
  jobs: [], // Jobs for the active board
  loading: false,
  error: null,
  ui: {
    selectedJob: null,
    activeModal: null, // 'view', 'edit', 'reminder', 'addColumn'
  }
};

// ==========================================
// SLICE
// ==========================================

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    // Manually set which board is active (e.g., if the user selects one from a dropdown)
    setActiveBoard: (state, action) => {
      state.activeBoard = action.payload;
    },
    // Clean up state on logout
    // clearBoardState: (state) => {
    //   state.boards = [];
    //   state.activeBoard = null;
    //   state.jobs = [];
    //   state.error = null;
    // },
    setModal: (state, action) => {
      state.ui.activeModal = action.payload.modal;
      state.ui.selectedJob = action.payload.job || null;
    },
    clearModal: (state) => {
      state.ui.activeModal = null;
      state.ui.selectedJob = null;
    },
    clearBoardState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Boards Logic
      .addCase(fetchMyBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload.data;

        // Auto-select the first board if none is active (Great for newly registered users)
        if (!state.activeBoard && action.payload.data.length > 0) {
          state.activeBoard = action.payload.data[0];
        }
      })
      .addCase(fetchMyBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Jobs Logic
      .addCase(fetchBoardJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data; // Includes the populated Virtual Reminders!
      })
      .addCase(fetchBoardJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //Update boards
      .addCase(updateJobColumn.pending, (state) => {
        state.error = null;
        // Notice: We omit state.loading = true here to prevent UI flickering
        // since the Kanban board uses an optimistic UI update.
      })
      .addCase(updateJobColumn.fulfilled, (state, action) => {
        // The backend returns the completely updated job object in action.payload.data
        const updatedJob = action.payload.data;

        // Find that specific job in our global Redux array and replace it
        const jobIndex = state.jobs.findIndex(
          (job) => job._id === updatedJob._id,
        );
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = updatedJob;
        }
      })
      .addCase(updateJobColumn.rejected, (state, action) => {
        state.error = action.payload;
        // In a production app, you might want to dispatch fetchBoardJobs() here
        // to "revert" the optimistic UI update if the backend failed.
      })

      //create new Jobs
      .addCase(createNewJob.fulfilled, (state, action) => {
        // Push the brand new job into the Redux jobs array instantly
        state.jobs.push(action.payload.data);
      })
      // Update Job Detail
      .addCase(updateJobDetails.fulfilled, (state, action) => {
        const updatedJob = action.payload.data;
        const index = state.jobs.findIndex((j) => j._id === updatedJob._id);
        if (index !== -1) state.jobs[index] = updatedJob;
      })
      // delete jobs
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((job) => job._id !== action.payload);
      })
      // update board column
      .addCase(updateBoardColumns.fulfilled, (state, action) => {
      // Update the active board with the new column configuration
      state.activeBoard = action.payload.data;
      state.loading = false;
    });
  },
});

export const { setActiveBoard, clearBoardState, setModal, clearModal } = boardSlice.actions;
export default boardSlice.reducer;
