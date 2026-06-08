import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  breakdowns: [],
  workstations: [],
};

const centerSlice = createSlice({
  name: "center",
  initialState,
  reducers: {
    setCenterData: (state, action) => {
      const data = action.payload;

      // ✅ Initial Full Load
      if (data.workstations && data.breakdowns) {
        state.workstations = data.workstations;
        state.breakdowns = data.breakdowns;
        return;
      }

      // ✅ Live Update Event
      if (data.type === "update") {
        const { workstation_id, breakdown_id, active } = data;

        const index = state.workstations.findIndex(
          (w) => w.id === workstation_id
        );

        if (index !== -1) {
          const ws = state.workstations[index];

          const status = ws.statuses.find(
            (s) => s.breakdown_id === breakdown_id
          );

          if (status) {
            status.active = active;
          }

          // 🔥 Move row to top when active
          if (active) {
            state.workstations.splice(index, 1);
            state.workstations.unshift(ws);
          }
        }
      }
    },
  },
});

export const { setCenterData } = centerSlice.actions;
export default centerSlice.reducer;