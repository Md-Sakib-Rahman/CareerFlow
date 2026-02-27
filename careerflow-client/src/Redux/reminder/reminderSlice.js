import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { privateApi } from "../../Axios/axiosInstance";

// 1. Fetch active reminders (reminders where reminderDate <= today)
export const fetchReminders = createAsyncThunk(
  "reminder/fetchReminders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await privateApi.get("/api/reminders/notifications");
      return response.data; // { success: true, count: X, data: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

// 2. Dismiss a specific reminder
export const dismissReminderAction = createAsyncThunk(
  "reminder/dismissReminder",
  async (reminderId, { rejectWithValue }) => {
    try {
      await privateApi.patch(`/api/reminders/${reminderId}/dismiss`);
      return reminderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Dismissal failed");
    }
  }
);

const reminderSlice = createSlice({
  name: "reminder",
  initialState: {
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => { state.loading = true; })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(dismissReminderAction.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      });
  },
});

export default reminderSlice.reducer;