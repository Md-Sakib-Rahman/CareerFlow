import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout, tokenRefreshed } from "./auth/authSlice";
import { setAuthHandlers } from "../Axios/axiosInstance";
import boardReducer from "./board/boardSlice";
import reminderReducer from "./reminder/reminderSlice";
import resumeReducer from "./resume/resumeSlice"; // <-- নতুন যোগ

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    reminder: reminderReducer,
    resume: resumeReducer, // <-- নতুন যোগ
  },
});

setAuthHandlers({
  onTokenRefreshed: (token) => store.dispatch(tokenRefreshed(token)),
  onSessionExpired: () => store.dispatch(logout()),
});
