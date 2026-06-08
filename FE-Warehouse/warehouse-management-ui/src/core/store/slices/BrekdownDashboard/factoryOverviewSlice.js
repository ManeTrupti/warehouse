import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
};

const factoryOverviewSlice = createSlice({
  name: "factoryOverview",
  initialState,
  reducers: {
    setFactoryData: (state, action) => {
      const payload = action.payload;

      /* ================= INITIAL LOAD ================= */
      // Format:
      // { data: [...] }
      if (payload?.data && Array.isArray(payload.data)) {
        state.data = payload.data;
        return;
      }

      /* ================= LIVE UPDATE ================= */
      // Format:
      // {
      //   event: "update",
      //   resource_id,
      //   workstation_id,
      //   is_ticket_raised
      // }

      if (payload?.event === "update") {
  const { resource_id, workstation_id, is_ticket_raised } = payload;

  const resource = state.data.find(
    (r) => Number(r.id) === Number(resource_id)
  );
  if (!resource) return;

  let workstation = resource.workstations?.find(
    (w) => Number(w.id) === Number(workstation_id)
  );

  if (workstation) {
    workstation.is_ticket_raised = is_ticket_raised;
  } else {
    // Optional: auto-add workstation if not found
    resource.workstations.push({
      id: workstation_id,
      name: `Workstation ${workstation_id}`,
      is_ticket_raised,
    });
  }
}
    },
  },
});

export const { setFactoryData } = factoryOverviewSlice.actions;
export default factoryOverviewSlice.reducer;