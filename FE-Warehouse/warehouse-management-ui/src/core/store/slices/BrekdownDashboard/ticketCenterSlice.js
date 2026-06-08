import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "./../../../../services/apiService";
import { buildGetApiUrl } from "./../../../../services/apiUtils";

export const acknowledgeTicket = createAsyncThunk(
  "ticketCenter/acknowledgeTicket",
  async (id, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(`/tickets/acknowledge/${id}/`);
      const response = await apiService.post(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error");
    }
  },
);

export const closeTicket = createAsyncThunk(
  "ticketCenter/closeTicket",
  async ({ id, remark }, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(`/tickets/close/${id}/`);

      const response = await apiService.post(url, { remark });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error");
    }
  },
);

const initialState = {
  dashboard: {
    total_open_tickets: 0,
    total_closed_tickets: 0,
    todays_tickets: 0,
    total_down_time_minutes: 0,
  },
  running: [],
  history: [],
};

const ticketCenterSlice = createSlice({
  name: "ticketCenter",
  initialState,
  reducers: {
    setInitialData: (state, action) => {
      state.dashboard = action.payload.dashboard;
      state.running = action.payload.running;
      state.history = action.payload.history;
    },

    ticketUpdated: (state, action) => {
      const { ticket, dashboard } = action.payload;

      if (!ticket) return;

      const index = state.running.findIndex(
        (t) => Number(t.id) === Number(ticket.id),
      );

      if (index !== -1) {
        if (ticket.status === "closed") {
          const closedTicket = {
            ...state.running[index],
            ...ticket,
          };

          state.running.splice(index, 1);
          state.history.unshift(closedTicket);
        } else {
          state.running[index] = {
            ...state.running[index],
            ...ticket,
          };
        }
      }

      if (dashboard) {
        state.dashboard = dashboard;
      }
    },

    ticketCreated: (state, action) => {
      const { ticket, dashboard } = action.payload;

      // Update dashboard
      state.dashboard = dashboard;

      // Add to running list if open
      if (ticket.status === "open") {
        state.running.unshift(ticket);
      }

      // Add to history
      state.history.unshift(ticket);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(acknowledgeTicket.fulfilled, () => {})
      .addCase(closeTicket.fulfilled, () => {});
  },
});

export const { setInitialData, ticketUpdated, ticketCreated } = ticketCenterSlice.actions;

export default ticketCenterSlice.reducer;
