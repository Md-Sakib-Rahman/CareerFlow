import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { privateApi } from "../../Axios/axiosInstance";

export const fetchReminders = createAsyncThunk(
  "reminder/fetchReminders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await privateApi.get("/api/reminders/notifications");
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

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
      .addCase(fetchReminders.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.loading = false;
        // 100% Accuracy: Defensively extract the array just like we did for jobs
        const notifData = action.payload?.data || action.payload || [];
        state.notifications = Array.isArray(notifData) ? notifData : [];
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