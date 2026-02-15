import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  message: "",
  type: "success", // success | error | info | warning
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showSnackbar: (state, action) => {
      state.isOpen = true;
      state.message = action.payload.message;
      state.type = action.payload.type || "success";
    },
    hideSnackbar: (state) => {
      state.isOpen = false;
      state.message = "";
    },
  },
});

export const { showSnackbar, hideSnackbar } = uiSlice.actions;
export default uiSlice.reducer;