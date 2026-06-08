import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../../../services/apiService";
import { buildGetApiUrl, buildPostApiUrl } from "../../../../services/apiUtils";

/* FETCH BREAKDOWN TYPES */
export const fetchBreakdownTypes = createAsyncThunk(
  "breakdown/fetchTypes",
  async (_, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl("/config/breakdowns/?page_size=10000");
      const response = await apiService.get(url);
      return response.data.results;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching breakdown types" }
      );
    }
  }
);

/* CREATE TICKET */
export const createTicket = createAsyncThunk(
  "breakdown/createTicket",
  async (data, { rejectWithValue }) => {
    try {
      const url = buildPostApiUrl("/tickets/");
      const response = await apiService.post(url, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to create ticket" }
      );
    }
  }
);

const breakdownSlice = createSlice({
  name: "breakdown",
  initialState: {
    types: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBreakdownTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBreakdownTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.types = action.payload;
      })
      .addCase(fetchBreakdownTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const selectBreakdownTypes = (state) =>
  state.breakdown?.types || [];

export const selectBreakdownLoading = (state) =>
  state.breakdown?.loading;

export default breakdownSlice.reducer;