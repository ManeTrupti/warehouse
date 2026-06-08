import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../../../services/apiService";
import {
  buildGetApiUrl,
  buildDeleteApiUrl,
  buildPostApiUrl,
} from "../../../../services/apiUtils";

const EXTERNAL_BASE = "https://planning-api.indi4.io";

// Fetch production plans
export const fetchProductionPlans = createAsyncThunk(
  "productionPlanning/fetchProductionPlans",
  async ({ date, product, shift } = {}, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl("/planning/production_plan/");
      const response = await apiService.get(url, {
        params: {
          ...(date ? { date } : {}),
          ...(product ? { product } : {}),
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
  },
);

//Add production plan
export const addProductionPlan = createAsyncThunk(
  "productionPlanning/addProductionPlan",
  async (plan, { rejectWithValue }) => {
    try {
      const url = buildPostApiUrl("/planning/production_plan/");
      const response = await apiService.post(url, plan);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to add production plan",
        },
      );
    }
  },
);

// Delete
export const deleteProductionPlans = createAsyncThunk(
  "productionPlanning/deleteProductionPlans",
  async (id, { rejectWithValue }) => {
    try {
      const url = buildDeleteApiUrl(`/planning/production_plan/${id}/`);
      await apiService.delete(url);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to delete production plans",
        },
      );
    }
  },
);

// fetch child plans date
export const fetchChildPlans = createAsyncThunk(
  "productionPlanning/fetchChildPlans",
  async ({ date } = {}, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl("/planning/auto_child_requirement/");
      const response = await apiService.get(url, {
        params: {
          ...(date ? { date } : {}),
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch child plans",
        },
      );
    }
  },
);

// Fetch products for production planning (used in Add Plan modal)
export const fetchPlanningProducts = createAsyncThunk(
  "productionPlanning/fetchPlanningProducts",
  async ({ date } = {}, { rejectWithValue }) => {
    try {
      const url = `${EXTERNAL_BASE}/plan-scheduling/product-plan/`;

      const response = await apiService.get(url, {
        params: {
          ...(date ? { date } : {}),
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch planning products",
        }
      );
    }
  }
);

// Fetch workstations for production planning
export const fetchWorkstations = createAsyncThunk(
  "productionPlanning/fetchWorkstations",
  async (_, { rejectWithValue }) => {
    try {
      const url = `${EXTERNAL_BASE}/mdm/workstations/list/`;
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || "Failed to fetch workstations",
        },
      );
    }
  },
);

// Fetch resources for production planning
export const fetchPlanningResources = createAsyncThunk(
  "productionPlanning/fetchPlanningResources",
  async (_, { rejectWithValue }) => {
    try {
      const url = `${EXTERNAL_BASE}/mdm/resources/list/`;
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to fetch planning resources",
        },
      );
    }
  },
);


const initialState = {
  plans: [],
  loading: false,
  error: null,
  deleting: false,
  childPlans: [],
  childPlansLoading: false,
  childPlansError: null,
  products: [],
  productsLoading: false,
  productsError: null,
  workstations: [],
  workstationsLoading: false,
  workstationsError: null,
  resources: [],
  resourcesLoading: false,
  resourcesError: null,
};

const productionPlanningSlice = createSlice({
  name: "productionPlanning",
  initialState,
  reducers: {
    clearProductionPlanningError: (state) => {
      state.error = null;
    },
    resetProductionPlans: (state) => {
      state.plans = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductionPlans.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const plansArray = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.results)
            ? payload.results
            : Array.isArray(payload)
              ? payload
              : [];
        state.plans = plansArray;
        state.error = null;
      })
      .addCase(fetchProductionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch production plans";
      })
      .addCase(deleteProductionPlans.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteProductionPlans.fulfilled, (state, action) => {
        state.deleting = false;
        const deletedId = action.payload;
        if (deletedId != null) {
          state.plans = state.plans.filter((plan) => plan.id !== deletedId);
        }
      })
      .addCase(deleteProductionPlans.rejected, (state, action) => {
        state.deleting = false;
      })
      .addCase(fetchChildPlans.pending, (state) => {
        state.childPlansLoading = true;
        state.childPlansError = null;
      })
      .addCase(fetchChildPlans.fulfilled, (state, action) => {
        state.childPlansLoading = false;
        state.childPlans = Array.isArray(action.payload) ? action.payload : [];
        state.childPlansError = null;
      })
      .addCase(fetchChildPlans.rejected, (state, action) => {
        state.childPlansLoading = false;
        state.childPlansError =
          action.payload?.message || "Failed to fetch child plans";
      })
      .addCase(fetchPlanningProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchPlanningProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        const payload = action.payload;
        state.products = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload)
            ? payload
            : [];
        state.productsError = null;
      })
      .addCase(fetchPlanningProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError =
          action.payload?.message || "Failed to fetch planning products";
      })
      .addCase(fetchWorkstations.pending, (state) => {
        state.workstationsLoading = true;
        state.workstationsError = null;
      })
      .addCase(fetchWorkstations.fulfilled, (state, action) => {
        state.workstationsLoading = false;
        const payload = action.payload;
        state.workstations = Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload)
            ? payload
            : [];
        state.workstationsError = null;
      })
      .addCase(fetchWorkstations.rejected, (state, action) => {
        state.workstationsLoading = false;
        state.workstationsError =
          action.payload?.message || "Failed to fetch workstations";
      })
      .addCase(fetchPlanningResources.pending, (state) => {
        state.resourcesLoading = true;
        state.resourcesError = null;
      })
      .addCase(fetchPlanningResources.fulfilled, (state, action) => {
        state.resourcesLoading = false;
        const payload = action.payload;
        state.resources = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.results)
            ? payload.results
            : Array.isArray(payload)
              ? payload
              : [];
        state.resourcesError = null;
      })
      .addCase(fetchPlanningResources.rejected, (state, action) => {
        state.resourcesLoading = false;
        state.resourcesError =
          action.payload?.message || "Failed to fetch planning resources";
      });
  },
});

export const { clearProductionPlanningError, resetProductionPlans } =
  productionPlanningSlice.actions;

export const selectProductionPlans = (state) =>
  state.productionPlanning.plans || [];
export const selectProductionPlanningLoading = (state) =>
  state.productionPlanning.loading;
export const selectProductionPlanningError = (state) =>
  state.productionPlanning.error;
export const selectProductionPlanningDeleting = (state) =>
  state.productionPlanning.deleting;
export const selectChildPlans = (state) =>
  state.productionPlanning.childPlans || [];
export const selectChildPlansLoading = (state) =>
  state.productionPlanning.childPlansLoading;
export const selectChildPlansError = (state) =>
  state.productionPlanning.childPlansError;
export const selectPlanningProducts = (state) =>
  state.productionPlanning.products || [];
export const selectPlanningProductsLoading = (state) =>
  state.productionPlanning.productsLoading;
export const selectPlanningProductsError = (state) =>
  state.productionPlanning.productsError;
export const selectWorkstations = (state) =>
  state.productionPlanning.workstations || [];
export const selectWorkstationsLoading = (state) =>
  state.productionPlanning.workstationsLoading;
export const selectWorkstationsError = (state) =>
  state.productionPlanning.workstationsError;
export const selectPlanningResources = (state) =>
  state.productionPlanning.resources || [];
export const selectPlanningResourcesLoading = (state) =>
  state.productionPlanning.resourcesLoading;
export const selectPlanningResourcesError = (state) =>
  state.productionPlanning.resourcesError;

export default productionPlanningSlice.reducer;
