import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resumes: JSON.parse(localStorage.getItem("resumes")) || [],
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    addResume: (state, action) => {
      state.resumes.push(action.payload);
      localStorage.setItem("resumes", JSON.stringify(state.resumes));
    },
    deleteResume: (state, action) => {
      state.resumes = state.resumes.filter((r) => r.id !== action.payload);
      localStorage.setItem("resumes", JSON.stringify(state.resumes));
    },
  },
});

export const { addResume, deleteResume } = resumeSlice.actions;
export default resumeSlice.reducer;
