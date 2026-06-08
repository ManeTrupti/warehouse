import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../../../services/apiService";
import {
  buildGetApiUrl,
  buildPostApiUrl,
  buildPutApiUrl,
  buildDeleteApiUrl,
} from "../../../../services/apiUtils";

// Generic helpers / constants for this entity slice
const ENTITY_KEY = "productionLossReasons";
const ENTITY_LABEL = "production loss reason";
const COLLECTION_LABEL = "production loss reasons";
const BASE_PATH = "/config/production-loss-reasons/";

const buildErrorPayload = (error, fallback) =>
  error?.response?.data || { message: error?.message || fallback };

/**
 * Normalize API response to extract items + pagination meta.
 * Supports both paginated responses and plain arrays.
 */
const normalizeListResponse = (data) => {
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.items)
        ? data.items
        : [];

  const count = typeof data?.count === "number" ? data.count : items.length;
  const totalPages =
    typeof data?.total_pages === "number" ? data.total_pages : 1;
  const currentPage =
    typeof data?.current_page === "number" ? data.current_page : 1;
  const pageSize =
    typeof data?.page_size === "number" ? data.page_size : items.length || 10;

  return {
    items,
    pagination: {
      count,
      totalPages,
      currentPage,
      pageSize,
    },
  };
};

// Async thunks for CRUD operations

/**
 * Fetch all production loss reasons (paginated)
 *
 * pageOrParams:
 * - undefined/null → first page with API default page size
 * - number → page number (builds ?page=N)
 * - string (http/https) → absolute URL from `next` / `previous`
 * - object → { page?: number, pageSize?: number } → builds ?page=N&page_size=M
 */
export const fetchProductionLossReasons = createAsyncThunk(
  `${ENTITY_KEY}/fetchAll`,
  async (pageOrParams, { rejectWithValue }) => {
    try {
      let url;
      if (typeof pageOrParams === "string" && pageOrParams.startsWith("http")) {
        url = pageOrParams;
      } else {
        let page;
        let pageSize;

        if (typeof pageOrParams === "number") {
          page = pageOrParams;
        } else if (
          pageOrParams &&
          typeof pageOrParams === "object" &&
          !Array.isArray(pageOrParams)
        ) {
          page = pageOrParams.page;
          pageSize = pageOrParams.pageSize;
        }

        const queryParts = [];
        if (page != null) queryParts.push(`page=${page}`);
        if (pageSize != null) queryParts.push(`page_size=${pageSize}`);
        const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";

        url = buildGetApiUrl(`${BASE_PATH}${queryString}`);
      }

      const response = await apiService.get(url);
      return normalizeListResponse(response.data);
    } catch (error) {
      return rejectWithValue(
        buildErrorPayload(error, `Failed to fetch ${COLLECTION_LABEL}`),
      );
    }
  },
);

/**
 * Create a new production loss reason
 * Backend payload: { "reason": "Test reason" }
 */
export const createProductionLossReason = createAsyncThunk(
  `${ENTITY_KEY}/create`,
  async (reasonData, { rejectWithValue }) => {
    try {
      const payload = { reason: reasonData.reason?.trim() || "" };

      // Use same neosoft host prefix as GET
      const url = buildGetApiUrl
        ? buildGetApiUrl(BASE_PATH)
        : buildPostApiUrl(BASE_PATH);

      const response = await apiService.post(url, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        buildErrorPayload(error, `Failed to create ${ENTITY_LABEL}`),
      );
    }
  },
);

/**
 * Update an existing production loss reason
 * Uses PATCH as per API spec
 */
export const updateProductionLossReason = createAsyncThunk(
  `${ENTITY_KEY}/update`,
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const payload = { reason: reason?.trim() || "" };
      const url = buildPutApiUrl
        ? buildPutApiUrl(`${BASE_PATH}${id}/`)
        : buildGetApiUrl(`${BASE_PATH}${id}/`);

      const response = await apiService.patch(url, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        buildErrorPayload(error, `Failed to update ${ENTITY_LABEL}`),
      );
    }
  },
);

/**
 * Delete a production loss reason
 */
export const deleteProductionLossReason = createAsyncThunk(
  `${ENTITY_KEY}/delete`,
  async (id, { rejectWithValue }) => {
    try {
      const url = buildDeleteApiUrl(`${BASE_PATH}${id}/`);
      await apiService.delete(url);
      return id;
    } catch (error) {
      return rejectWithValue(
        buildErrorPayload(error, `Failed to delete ${ENTITY_LABEL}`),
      );
    }
  },
);

// Initial state
const initialState = {
  productionLossReasons: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  pagination: {
    count: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
  },
};

// Slice
const productionLossReasonsSlice = createSlice({
  name: ENTITY_KEY,
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetProductionLossReasons: (state) => {
      state.productionLossReasons = [];
      state.error = null;
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchProductionLossReasons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductionLossReasons.fulfilled, (state, action) => {
        state.loading = false;
        state.productionLossReasons = Array.isArray(action.payload?.items)
          ? action.payload.items
          : [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(fetchProductionLossReasons.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || `Failed to fetch ${COLLECTION_LABEL}`;
      });

    // Create
    builder
      .addCase(createProductionLossReason.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createProductionLossReason.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.productionLossReasons.push(action.payload);
          state.pagination.count += 1;
        }
        state.error = null;
      })
      .addCase(createProductionLossReason.rejected, (state, action) => {
        state.creating = false;
        state.error =
          action.payload?.message || `Failed to create ${ENTITY_LABEL}`;
      });

    // Update
    builder
      .addCase(updateProductionLossReason.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProductionLossReason.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload;
        if (updated && updated.id != null) {
          const index = state.productionLossReasons.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.productionLossReasons[index] = updated;
          }
        }
        state.error = null;
      })
      .addCase(updateProductionLossReason.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.payload?.message || `Failed to update ${ENTITY_LABEL}`;
      });

    // Delete
    builder
      .addCase(deleteProductionLossReason.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteProductionLossReason.fulfilled, (state, action) => {
        state.deleting = false;
        state.productionLossReasons = state.productionLossReasons.filter(
          (item) => item.id !== action.payload,
        );
        state.pagination.count = Math.max(0, state.pagination.count - 1);
        state.error = null;
      })
      .addCase(deleteProductionLossReason.rejected, (state, action) => {
        state.deleting = false;
        state.error =
          action.payload?.message || `Failed to delete ${ENTITY_LABEL}`;
      });
  },
});

// Actions
export const { clearError, resetProductionLossReasons } =
  productionLossReasonsSlice.actions;

// Selectors
export const selectProductionLossReasons = (state) =>
  state.productionLossReasons.productionLossReasons;
export const selectProductionLossReasonsLoading = (state) =>
  state.productionLossReasons.loading;
export const selectProductionLossReasonsError = (state) =>
  state.productionLossReasons.error;
export const selectProductionLossReasonsCreating = (state) =>
  state.productionLossReasons.creating;
export const selectProductionLossReasonsUpdating = (state) =>
  state.productionLossReasons.updating;
export const selectProductionLossReasonsDeleting = (state) =>
  state.productionLossReasons.deleting;
export const selectProductionLossReasonsPagination = (state) =>
  state.productionLossReasons.pagination;

export default productionLossReasonsSlice.reducer;

