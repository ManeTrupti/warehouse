import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "./../../../../services/apiService";
import { buildGetApiUrl } from "./../../../../services/apiUtils";

/*BASE PATHS */
const EXTERNAL_BASE = "https://planning-api.indi4.io";

// /* FETCH RESOURCES */

// export const fetchResources = createAsyncThunk(
//   "shiftUpdate/fetchResources",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await apiService.get(
//         `${EXTERNAL_BASE}/mdm/resources-list/`,
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data || { message: "Failed to fetch resources" },
//       );
//     }
//   },
// );

// /* FETCH OPERATION SEQUENCES (Work Stations)*/

// export const fetchOperationSequences = createAsyncThunk(
//   "shiftUpdate/fetchOperationSequences",
//   async (resourceId, { rejectWithValue }) => {
//     try {
//       const response = await apiService.get(
//         `${EXTERNAL_BASE}/mdm/operation-sequences/?resource_id=${resourceId}`,
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error?.response?.data || {
//           message: "Failed to fetch operation sequences",
//         },
//       );
//     }
//   },
// );

/* FETCH RESOURCES  (Work Stations)*/
export const fetchResources = createAsyncThunk(
  "shiftUpdate/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(
        `${EXTERNAL_BASE}/mdm/resources/list`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to fetch resources list" }
      );
    }
  }
);

/*  FETCH SHIFTS (Internal - neosoft host) */

export const fetchShifts = createAsyncThunk(
  "shiftUpdate/fetchShifts",
  async (_, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl("/shift-update/shift-update-options/");
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to fetch shifts Details" },
      );
    }
  },
);

/* Fetch Product list */

export const fetchProducts = createAsyncThunk(
  "shiftUpdate/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get(
        `${EXTERNAL_BASE}/mdm/product-list/`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to fetch products" },
      );
    }
  },
);

export const fetchProductAndPlans = createAsyncThunk(
  "productionPlanning/fetchProductionPlans",
  async ({ date, shift } = {}, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl("/planning/production_plan/");
      const response = await apiService.get(url, {
        params: {
          ...(date ? { date } : {}),
          ...(shift ? { shift } : {}),
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch production plans",
        },
      );
    }
  }
);

/* CREATE SHIFT UPDATE */

export const createShiftUpdate = createAsyncThunk(
  "shiftUpdate/createShiftUpdate",
  async (payload, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl("/shift-update/shift-updates/");
      const response = await apiService.post(url, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to submit shift update" },
      );
    }
  },
);


/* FETCH RECENT ENTRIES */

export const fetchRecentEntries = createAsyncThunk(
  "shiftUpdate/fetchRecentEntries",
  async (params, { rejectWithValue }) => {
    try {
      const {
        date,
        resource_id,
        workstation_id,
        shift,
        product_id,
      } = params;

      const url = buildGetApiUrl(
        `/shift-update/recent-entries/?date=${date}` +
          `${resource_id ? `&resource_id=${resource_id}` : ""}` +
          `${workstation_id ? `&workstation_id=${workstation_id}` : ""}` +
          `${shift ? `&shift=${shift}` : ""}` +
          `${product_id ? `&product_id=${product_id}` : ""}`
      );

      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to fetch recent entries" }
      );
    }
  }
);


/* INITIAL STATE*/

const initialState = {
  resources: [],
  // operationSequences: [],

  shifts: [],
  rejectionReasons: [],
  productionLossReasons: [],

  products: [],

  recentEntries: [],
loadingRecentEntries: false,

  loadingResources: false,
  // loadingOperationSequences: false,
  loadingShifts: false,
  loadingProducts: false,

  productionPlans: [],


  error: null,
};
/*SLICE*/

const shiftUpdateSlice = createSlice({
  name: "shiftUpdate",
  initialState,
  reducers: {
    clearShiftUpdateError: (state) => {
      state.error = null;
    },
    resetOperationSequences: (state) => {
      state.operationSequences = [];
    },
  },
  extraReducers: (builder) => {
    /*Resources*/
   builder
  .addCase(fetchResources.pending, (state) => {
    state.loadingResources = true;
    state.error = null;
  })
  .addCase(fetchResources.fulfilled, (state, action) => {
    state.loadingResources = false;
    state.resources = Array.isArray(action.payload)
  ? action.payload
  : action.payload?.data || [];
  })
  .addCase(fetchResources.rejected, (state, action) => {
    state.loadingResources = false;
    state.error =
      action.payload?.message || "Failed to fetch resources";
  });

    /*Operation Sequences*/
    // builder
    //   .addCase(fetchOperationSequences.pending, (state) => {
    //     state.loadingOperationSequences = true;
    //     state.error = null;
    //   })
    //   .addCase(fetchOperationSequences.fulfilled, (state, action) => {
    //     state.loadingOperationSequences = false;
    //     state.operationSequences = Array.isArray(action.payload?.workstations)
    //       ? action.payload.workstations
    //       : [];
    //   })
    //   .addCase(fetchOperationSequences.rejected, (state, action) => {
    //     state.loadingOperationSequences = false;
    //     state.error =
    //       action.payload?.message || "Failed to fetch operation sequences";
    //   });



    /*Shifts*/
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.loadingShifts = true;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loadingShifts = false;

        state.shifts = Array.isArray(action.payload?.shifts)
          ? action.payload.shifts
          : [];

        state.rejectionReasons = Array.isArray(
          action.payload?.rejection_reasons,
        )
          ? action.payload.rejection_reasons
          : [];

        state.productionLossReasons = Array.isArray(
          action.payload?.production_loss_reasons,
        )
          ? action.payload.production_loss_reasons
          : [];
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loadingShifts = false;
        state.error = action.payload?.message || "Failed to fetch shifts";
      });

    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loadingProducts = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loadingProducts = false;
        state.products = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loadingProducts = false;
        state.error = action.payload?.message || "Failed to fetch products";
      });

    builder
      .addCase(createShiftUpdate.pending, (state) => {
        state.error = null;
      })
      .addCase(createShiftUpdate.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(createShiftUpdate.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to submit shift update";
      });

      /* Recent Entries */
builder
  .addCase(fetchRecentEntries.pending, (state) => {
    state.loadingRecentEntries = true;
  })
  .addCase(fetchRecentEntries.fulfilled, (state, action) => {
    state.loadingRecentEntries = false;
    state.recentEntries = Array.isArray(action.payload)
      ? action.payload
      : [];
  })
  .addCase(fetchRecentEntries.rejected, (state) => {
    state.loadingRecentEntries = false;
    state.recentEntries = [];
  });
  
  /* Production Plans */
builder
  .addCase(fetchProductAndPlans.pending, (state) => {
    state.productionPlans = [];
  })
  .addCase(fetchProductAndPlans.fulfilled, (state, action) => {
    state.productionPlans = Array.isArray(action.payload?.data)
      ? action.payload.data
      : [];
  })
  .addCase(fetchProductAndPlans.rejected, (state) => {
    state.productionPlans = [];
  });
  },
});

/* EXPORTS */

export const { clearShiftUpdateError, resetOperationSequences } =
  shiftUpdateSlice.actions;

export const selectResources = (state) => state.shiftUpdate.resources;

export const selectProducts = (state) => state.shiftUpdate.products;

// export const selectOperationSequences = (state) =>
//   state.shiftUpdate.operationSequences;

export const selectShiftUpdateLoading = (state) => ({
  loadingResources: state.shiftUpdate.loadingResources,
});

export const selectShiftUpdateError = (state) => state.shiftUpdate.error;

export const selectShifts = (state) => state.shiftUpdate.shifts;

export const selectRejectionReasons = (state) =>
  state.shiftUpdate.rejectionReasons;

export const selectProductionLossReasons = (state) =>
  state.shiftUpdate.productionLossReasons;

export const selectRecentEntries = (state) =>
  state.shiftUpdate.recentEntries;

export const selectRecentEntriesLoading = (state) =>
  state.shiftUpdate.loadingRecentEntries;

export const selectProductAndPlans = (state) =>
  state.shiftUpdate.productionPlans;


export default shiftUpdateSlice.reducer;
