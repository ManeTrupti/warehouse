import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../../../services/apiService";
import {
  buildGetApiUrl,
  buildPostApiUrl,
  buildPutApiUrl,
  buildDeleteApiUrl,
} from "../../../../services/apiUtils";

// Generic helpers / constants for this entity slice
const ENTITY_KEY = "downtimeReasons";
const ENTITY_LABEL = "downtime reason";
const COLLECTION_LABEL = "downtime reasons";
const BASE_PATH = "/config/downtime-reasons/";

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

  const count =
    typeof data?.count === "number" ? data.count : items.length;
  const totalPages =
    typeof data?.total_pages === "number" ? data.total_pages : 1;
  const currentPage =
    typeof data?.current_page === "number" ? data.current_page : 1;
  const pageSize =
    typeof data?.page_size === "number"
      ? data.page_size
      : items.length || 10;

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
 * Fetch all downtime reasons
 *
 * pageOrParams:
 * - undefined/null → first page with API default page size
 * - number → page number (builds ?page=N)
 * - string (http/https) → absolute URL from `next` / `previous`
 * - object → { page?: number, pageSize?: number } → builds ?page=N&page_size=M
 */
export const fetchDowntimeReasons = createAsyncThunk(
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
      // Enhanced error logging for CORS issues
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('Network Error')) {
        console.error(`[${ENTITY_KEY}] CORS Error Details:`, {
          message: error.message,
          code: error.code,
          url: buildGetApiUrl(BASE_PATH),
          origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
          suggestion: 'Check backend CORS settings. Ensure http://localhost:3000 is in CORS_ALLOWED_ORIGINS or CORS_ALLOW_ALL=True',
        });
      }
      
      return rejectWithValue(
        buildErrorPayload(error, `Failed to fetch ${COLLECTION_LABEL}`),
      );
    }
  },
);

/**
 * Create a new downtime reason
 * Backend payload: { "category": 3, "reason": "Tool Change" }
 */
export const createDowntimeReason = createAsyncThunk(
  `${ENTITY_KEY}/create`,
  async (reasonData, { rejectWithValue }) => {
    try {
      const payload = {
        category: reasonData.category ? Number(reasonData.category) : null,
        reason: reasonData.reason?.trim() || "",
      };

      // POST uses same neosoft host as GET
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
 * Update an existing downtime reason
 * Uses PATCH as per API spec
 */
export const updateDowntimeReason = createAsyncThunk(
  `${ENTITY_KEY}/update`,
  async ({ id, category, reason }, { rejectWithValue }) => {
    try {
      const payload = {
        category: category ? Number(category) : null,
        reason: reason?.trim() || "",
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
 * Delete a downtime reason
 */
export const deleteDowntimeReason = createAsyncThunk(
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
  downtimeReasons: [],
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
const downtimeReasonsSlice = createSlice({
  name: ENTITY_KEY,
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetDowntimeReasons: (state) => {
      state.downtimeReasons = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchDowntimeReasons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDowntimeReasons.fulfilled, (state, action) => {
        state.loading = false;
        state.downtimeReasons = Array.isArray(action.payload?.items)
          ? action.payload.items
          : [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(fetchDowntimeReasons.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          `Failed to fetch ${COLLECTION_LABEL}`;
      });

    // Create
    builder
      .addCase(createDowntimeReason.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createDowntimeReason.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.downtimeReasons.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createDowntimeReason.rejected, (state, action) => {
        state.creating = false;
        state.error =
          action.payload?.message ||
          `Failed to create ${ENTITY_LABEL}`;
      });

    // Update
    builder
      .addCase(updateDowntimeReason.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateDowntimeReason.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload;
        if (updated && updated.id != null) {
          const index = state.downtimeReasons.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.downtimeReasons[index] = updated;
          }
        }
        state.error = null;
      })
      .addCase(updateDowntimeReason.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.payload?.message ||
          `Failed to update ${ENTITY_LABEL}`;
      });

    // Delete
    builder
      .addCase(deleteDowntimeReason.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteDowntimeReason.fulfilled, (state, action) => {
        state.deleting = false;
        state.downtimeReasons = state.downtimeReasons.filter(
          (item) => item.id !== action.payload,
        );
        state.error = null;
      })
      .addCase(deleteDowntimeReason.rejected, (state, action) => {
        state.deleting = false;
        state.error =
          action.payload?.message ||
          `Failed to delete ${ENTITY_LABEL}`;
      });
  },
});

// Actions
export const { clearError, resetDowntimeReasons } =
  downtimeReasonsSlice.actions;

// Selectors
export const selectDowntimeReasons = (state) =>
  state.downtimeReasons.downtimeReasons;
export const selectDowntimeReasonsLoading = (state) =>
  state.downtimeReasons.loading;
export const selectDowntimeReasonsError = (state) =>
  state.downtimeReasons.error;
export const selectDowntimeReasonsCreating = (state) =>
  state.downtimeReasons.creating;
export const selectDowntimeReasonsUpdating = (state) =>
  state.downtimeReasons.updating;
export const selectDowntimeReasonsDeleting = (state) =>
  state.downtimeReasons.deleting;
export const selectDowntimeReasonsPagination = (state) =>
  state.downtimeReasons.pagination;

export default downtimeReasonsSlice.reducer;

