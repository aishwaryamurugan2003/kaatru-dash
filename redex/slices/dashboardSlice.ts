import { createSlice } from "@reduxjs/toolkit";

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    devices: [],
    currentIndex: 0,
  },
  reducers: {
    setDevices: (state, action) => {
      state.devices = action.payload;
    },
    updateDevice: (state, action) => {
      const i = state.devices.findIndex(d => d.id === action.payload.id);
      if (i >= 0) state.devices[i] = { ...state.devices[i], ...action.payload };
    },
    setIndex: (state, action) => {
      state.currentIndex = action.payload;
    },
  },
});

export const { setDevices, updateDevice, setIndex } = dashboardSlice.actions;
export default dashboardSlice.reducer;
