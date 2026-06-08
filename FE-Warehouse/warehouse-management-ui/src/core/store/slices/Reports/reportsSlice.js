import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  buildGetApiUrl,
  buildInventoryGetApiUrl,
  buildPostApiUrl,
} from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

const buildReportFiltersQuery = ({ month, year, financialYear } = {}) => {
  const params = new URLSearchParams();
  if (month) params.set("month", month);
  if (financialYear) params.set("financial_year", financialYear);
  else if (year) params.set("year", year);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

/* FETCH INVENTORY STOCKS */

export const subinventoryReport = createAsyncThunk(
  "reports/subinventoryReport",
  async ({ month, year, financialYear } = {}, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(
        `/warehouse/dashboard/subinventory/${buildReportFiltersQuery({
          month,
          year,
          financialYear,
        })}`,
      );

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Error fetching  Subinventory Report",
        },
      );
    }
  },
);

export const overviewReportCard = createAsyncThunk(
  "reports/overviewReportCard",
  async ({ month, year, financialYear } = {}, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(
        `/warehouse/dashboard/${buildReportFiltersQuery({
          month,
          year,
          financialYear,
        })}`,
      );

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Error fetching  Subinventory Report",
        },
      );
    }
  },
);

export const zoneReport = createAsyncThunk(
  "reports/zoneReport",
  async ({ month, year, financialYear } = {}, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(
        `/warehouse/dashboard/zone/${buildReportFiltersQuery({
          month,
          year,
          financialYear,
        })}`,
      );

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Error fetching  Subinventory Report",
        },
      );
    }
  },
);

// comment
export const rackReport = createAsyncThunk(
  "reports/rackReport",
  async ({ month, year, financialYear } = {}, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(
        `/warehouse/dashboard/rack/${buildReportFiltersQuery({
          month,
          year,
          financialYear,
        })}`,
      );
      const response = await apiService.get(url);

      // const response = await apiService.get("https://neosoft-warehouse-test.indi4.io/api/warehouse/dashboard/rack/");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Error fetching  Subinventory Report",
        },
      );
    }
  },
);

export const binReport = createAsyncThunk(
  "reports/binReport",
  async ({ month, year, financialYear } = {}, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(
        `/warehouse/dashboard/bin/${buildReportFiltersQuery({
          month,
          year,
          financialYear,
        })}`,
      );

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching  Bin Report" },
      );
    }
  },
);

export const movementTrendReport = createAsyncThunk(
  "reports/movementTrendReport",
  async ({ days, month, year, financialYear } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (month) params.set("month", month);
      if (financialYear) params.set("financial_year", financialYear);
      else if (year) params.set("year", year);
      else if (days != null) params.set("days", String(days));

      const qs = params.toString();
      const url = buildGetApiUrl(
        `/warehouse/dashboard/movement-trend/${qs ? `?${qs}` : ""}`,
      );

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Error fetching Movement Trend Report",
        },
      );
    }
  },
);

const initialState = {
  subinventoryData: [],
  overviewReportCardData: [],
  zoneReportData: [],
  rackReportData: [],
  binReportData: [],
  movementTrendReportData: [],
  loading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(subinventoryReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(subinventoryReport.fulfilled, (state, action) => {
        state.loading = false;
        state.subinventoryData = action.payload.data;
      })
      .addCase(subinventoryReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(overviewReportCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(overviewReportCard.fulfilled, (state, action) => {
        state.loading = false;
        state.overviewReportCardData = action.payload;
      })
      .addCase(overviewReportCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(zoneReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(zoneReport.fulfilled, (state, action) => {
        state.loading = false;
        state.zoneReportData = action.payload?.data;
      })
      .addCase(zoneReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(rackReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(rackReport.fulfilled, (state, action) => {
        state.loading = false;
        state.rackReportData = action.payload?.data;
      })
      .addCase(rackReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // bin report
      .addCase(binReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(binReport.fulfilled, (state, action) => {
        state.loading = false;
        state.binReportData = action.payload?.data;
      })
      .addCase(binReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      // movement trend report
      .addCase(movementTrendReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(movementTrendReport.fulfilled, (state, action) => {
        state.loading = false;
        state.movementTrendReportData = action.payload;
      })
      .addCase(movementTrendReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearError } = reportsSlice.actions;

export default reportsSlice.reducer;
