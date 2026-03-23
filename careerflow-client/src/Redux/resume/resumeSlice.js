import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resumes: [],
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,

  reducers: {
    addResume: (state, action) => {
      state.resumes.push(action.payload);
    },

    deleteResume: (state, action) => {
      state.resumes = state.resumes.filter(
        (resume) => resume.id !== action.payload,
      );
    },
  },
});

export const { addResume, deleteResume } = resumeSlice.actions;
export default resumeSlice.reducer;
