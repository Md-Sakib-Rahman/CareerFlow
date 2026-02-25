import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { publicApi, privateApi } from "../../Axios/axiosInstance";

// what is it ? : This async thunk is feature of redux to wrap the api call to handle it better

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await publicApi.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "login fail");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await publicApi.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Resgistration Failed ! ",
      );
    }
  },
);

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await publicApi.post("/auth/send-otp", { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "OTP failed");
    }
  },
);
export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      // Assuming your backend route is GET /auth/me
      const response = await privateApi.get("/auth/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Session expired");
    }
  }
);
export const googleSignInThunk = createAsyncThunk(
  "auth/googleSignIn",
  async (idToken, { rejectWithValue }) => {
    try {
      const response = await publicApi.post("/auth/google", { idToken });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Google Sign-In failed");
    }
  }
);
// INITIAL STATE

const initialState = {
  user: null,
  accessToken: localStorage.getItem("accessToken") || null,
  loading: false,
  error: null,
  otpSent: false
};

//SLICE

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
        state.user = null 
        state.accessToken = null
        localStorage.removeItem("accessToken")
    },
    clearError: (state) => (state.error = null),
  },
  extraReducers: (builder) => {
    builder
      // Login Logic
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register Logic
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload.data;
        state.accessToken = action.payload.accessToken;
        state.otpSent = false;
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // OTP Logic
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;  
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
         
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.otpSent = false;
      })
      // Fetch Me Logic
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data; // Hydrate the user data!
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken"); // Token is invalid/expired, clear it
      })
    //   Google Sign in 
    .addCase(googleSignInThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignInThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(googleSignInThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
