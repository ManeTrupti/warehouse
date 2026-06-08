import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../../../services/apiService";
import {
  buildGetApiUrl,
  buildPostApiUrl,
  buildPutApiUrl,
  buildDeleteApiUrl,
} from "../../../../services/apiUtils";

// Generic helpers / constants for this entity slice
const ENTITY_KEY = "breakdowns";
const ENTITY_LABEL = "breakdown";
const COLLECTION_LABEL = "breakdowns";
const BASE_PATH = "/config/breakdowns/";

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
 * Fetch all breakdowns (paginated)
 *
 * pageOrParams:
 * - undefined/null → first page with API default page size
 * - number → page number (builds ?page=N)
 * - string (http/https) → absolute URL from `next` / `previous`
 * - object → { page?: number, pageSize?: number } → builds ?page=N&page_size=M
 */
export const fetchBreakdowns = createAsyncThunk(
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
 * Create a new breakdown
 * Backend payload: { "name": "Oil Leak" }
 */
export const createBreakdown = createAsyncThunk(
  `${ENTITY_KEY}/create`,
  async (data, { rejectWithValue }) => {
    try {
      const payload = {
        name: data.name?.trim() || "",
      };

      const url = buildPostApiUrl(BASE_PATH);
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
 * Update an existing breakdown
 * Uses PATCH as per API spec
 */
export const updateBreakdown = createAsyncThunk(
  `${ENTITY_KEY}/update`,
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const payload = {
        name: name?.trim() || "",
      };
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
 * Delete a breakdown
 */
export const deleteBreakdown = createAsyncThunk(
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
  breakdowns: [],
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
const breakdownsSlice = createSlice({
  name: ENTITY_KEY,
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetBreakdowns: (state) => {
      state.breakdowns = [];
      state.error = null;
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchBreakdowns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBreakdowns.fulfilled, (state, action) => {
        state.loading = false;
        state.breakdowns = Array.isArray(action.payload?.items)
          ? action.payload.items
          : [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(fetchBreakdowns.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || `Failed to fetch ${COLLECTION_LABEL}`;
      });

    // Create
    builder
      .addCase(createBreakdown.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createBreakdown.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.breakdowns.push(action.payload);
          state.pagination.count += 1;
        }
        state.error = null;
      })
      .addCase(createBreakdown.rejected, (state, action) => {
        state.creating = false;
        state.error =
          action.payload?.message || `Failed to create ${ENTITY_LABEL}`;
      });

    // Update
    builder
      .addCase(updateBreakdown.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateBreakdown.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload;
        if (updated && updated.id != null) {
          const index = state.breakdowns.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.breakdowns[index] = updated;
          }
        }
        state.error = null;
      })
      .addCase(updateBreakdown.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.payload?.message || `Failed to update ${ENTITY_LABEL}`;
      });

    // Delete
    builder
      .addCase(deleteBreakdown.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteBreakdown.fulfilled, (state, action) => {
        state.deleting = false;
        state.breakdowns = state.breakdowns.filter(
          (item) => item.id !== action.payload,
        );
        state.pagination.count = Math.max(0, state.pagination.count - 1);
        state.error = null;
      })
      .addCase(deleteBreakdown.rejected, (state, action) => {
        state.deleting = false;
        state.error =
          action.payload?.message || `Failed to delete ${ENTITY_LABEL}`;
      });
  },
});

// Actions
export const { clearError, resetBreakdowns } = breakdownsSlice.actions;

// Selectors
export const selectBreakdowns = (state) => state.breakdowns.breakdowns;
export const selectBreakdownsLoading = (state) => state.breakdowns.loading;
export const selectBreakdownsError = (state) => state.breakdowns.error;
export const selectBreakdownsCreating = (state) => state.breakdowns.creating;
export const selectBreakdownsUpdating = (state) => state.breakdowns.updating;
export const selectBreakdownsDeleting = (state) => state.breakdowns.deleting;
export const selectBreakdownsPagination = (state) =>
  state.breakdowns.pagination;

export default breakdownsSlice.reducer;
