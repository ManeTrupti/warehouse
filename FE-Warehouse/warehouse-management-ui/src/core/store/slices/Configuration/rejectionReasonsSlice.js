import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../../../services/apiService";
import {
  buildGetApiUrl,
  buildPostApiUrl,
  buildPutApiUrl,
  buildDeleteApiUrl,
} from "../../../../services/apiUtils";

// Generic helpers / constants for this entity slice
const ENTITY_KEY = "rejectionReasons";
const ENTITY_LABEL = "rejection reason";
const COLLECTION_LABEL = "rejection reasons";
const BASE_PATH = "/config/rejection-reasons/";

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
 * Fetch all rejection reasons
 *
 * pageOrParams:
 * - undefined/null → first page with API default page size
 * - number → page number (builds ?page=N)
 * - string (http/https) → absolute URL from `next` / `previous`
 * - object → { page?: number, pageSize?: number } → builds ?page=N&page_size=M
 */
export const fetchRejectionReasons = createAsyncThunk(
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
 * Create a new rejection reason
 */
export const createRejectionReason = createAsyncThunk(
  `${ENTITY_KEY}/create`,
  async (reasonData, { rejectWithValue }) => {
    try {
      // Backend expects { reason: "Tool Wear" }
      const payload = { reason: reasonData.reason?.trim() || "" };

      // API spec: POST uses the same neosoft host prefix as GET
      const url = buildGetApiUrl(BASE_PATH);

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
 * Update an existing rejection reason
 * Uses PATCH as per API spec
 */
export const updateRejectionReason = createAsyncThunk(
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
 * Delete a rejection reason
 */
export const deleteRejectionReason = createAsyncThunk(
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
  rejectionReasons: [],
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
const rejectionReasonsSlice = createSlice({
  name: ENTITY_KEY,
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRejectionReasons: (state) => {
      state.rejectionReasons = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchRejectionReasons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRejectionReasons.fulfilled, (state, action) => {
        state.loading = false;
        state.rejectionReasons = Array.isArray(action.payload?.items)
          ? action.payload.items
          : [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(fetchRejectionReasons.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || `Failed to fetch ${COLLECTION_LABEL}`;
      });

    // Create
    builder
      .addCase(createRejectionReason.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createRejectionReason.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.rejectionReasons.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createRejectionReason.rejected, (state, action) => {
        state.creating = false;
        state.error =
          action.payload?.message || `Failed to create ${ENTITY_LABEL}`;
      });

    // Update
    builder
      .addCase(updateRejectionReason.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateRejectionReason.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload;
        if (updated && updated.id != null) {
          const index = state.rejectionReasons.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.rejectionReasons[index] = updated;
          }
        }
        state.error = null;
      })
      .addCase(updateRejectionReason.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.payload?.message || `Failed to update ${ENTITY_LABEL}`;
      });

    // Delete
    builder
      .addCase(deleteRejectionReason.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteRejectionReason.fulfilled, (state, action) => {
        state.deleting = false;
        state.rejectionReasons = state.rejectionReasons.filter(
          (item) => item.id !== action.payload,
        );
        state.error = null;
      })
      .addCase(deleteRejectionReason.rejected, (state, action) => {
        state.deleting = false;
        state.error =
          action.payload?.message || `Failed to delete ${ENTITY_LABEL}`;
      });
  },
});

// Actions
export const { clearError, resetRejectionReasons } =
  rejectionReasonsSlice.actions;

// Selectors
export const selectRejectionReasons = (state) =>
  state.rejectionReasons.rejectionReasons;
export const selectRejectionReasonsLoading = (state) =>
  state.rejectionReasons.loading;
export const selectRejectionReasonsError = (state) =>
  state.rejectionReasons.error;
export const selectRejectionReasonsCreating = (state) =>
  state.rejectionReasons.creating;
export const selectRejectionReasonsUpdating = (state) =>
  state.rejectionReasons.updating;
export const selectRejectionReasonsDeleting = (state) =>
  state.rejectionReasons.deleting;
export const selectRejectionReasonsPagination = (state) =>
  state.rejectionReasons.pagination;

export default rejectionReasonsSlice.reducer;
