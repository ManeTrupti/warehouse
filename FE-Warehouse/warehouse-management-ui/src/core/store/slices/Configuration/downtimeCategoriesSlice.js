import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../../../services/apiService";
import {
  buildGetApiUrl,
  buildPutApiUrl,
  buildDeleteApiUrl,
} from "../../../../services/apiUtils";

// Generic helpers / constants for this entity slice
const ENTITY_KEY = "downtimeCategories";
const ENTITY_LABEL = "downtime category";
const COLLECTION_LABEL = "downtime categories";
const BASE_PATH = "/config/downtime-categories/";

const buildErrorPayload = (error, fallback) =>
  error?.response?.data || { message: error?.message || fallback };

// Normalize list responses that may be paginated or wrapped
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
 * Fetch all downtime categories
 *
 * pageOrParams:
 * - undefined/null → first page with API default page size
 * - number → page number (builds ?page=N)
 * - string (http/https) → absolute URL from `next` / `previous`
 * - object → { page?: number, pageSize?: number } → builds ?page=N&page_size=M
 */
export const fetchDowntimeCategories = createAsyncThunk(
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
 * Create a new downtime category
 * Backend payload: { "category": "category" }
 */
export const createDowntimeCategory = createAsyncThunk(
  `${ENTITY_KEY}/create`,
  async (categoryData, { rejectWithValue }) => {
    try {
      const payload = { category: categoryData.category?.trim() || "" };

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
 * Update an existing downtime category
 * Uses PATCH as per API spec
 */
export const updateDowntimeCategory = createAsyncThunk(
  `${ENTITY_KEY}/update`,
  async ({ id, category }, { rejectWithValue }) => {
    try {
      const payload = { category: category?.trim() || "" };
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
 * Delete a downtime category
 */
export const deleteDowntimeCategory = createAsyncThunk(
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
  downtimeCategories: [],
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
const downtimeCategoriesSlice = createSlice({
  name: ENTITY_KEY,
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetDowntimeCategories: (state) => {
      state.downtimeCategories = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchDowntimeCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDowntimeCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.downtimeCategories = Array.isArray(action.payload?.items)
          ? action.payload.items
          : [];
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(fetchDowntimeCategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ||
          `Failed to fetch ${COLLECTION_LABEL}`;
      });

    // Create
    builder
      .addCase(createDowntimeCategory.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createDowntimeCategory.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.downtimeCategories.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createDowntimeCategory.rejected, (state, action) => {
        state.creating = false;
        state.error =
          action.payload?.message ||
          `Failed to create ${ENTITY_LABEL}`;
      });

    // Update
    builder
      .addCase(updateDowntimeCategory.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateDowntimeCategory.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload;
        if (updated && updated.id != null) {
          const index = state.downtimeCategories.findIndex(
            (item) => item.id === updated.id,
          );
          if (index !== -1) {
            state.downtimeCategories[index] = updated;
          }
        }
        state.error = null;
      })
      .addCase(updateDowntimeCategory.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.payload?.message ||
          `Failed to update ${ENTITY_LABEL}`;
      });

    // Delete
    builder
      .addCase(deleteDowntimeCategory.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteDowntimeCategory.fulfilled, (state, action) => {
        state.deleting = false;
        state.downtimeCategories = state.downtimeCategories.filter(
          (item) => item.id !== action.payload,
        );
        state.error = null;
      })
      .addCase(deleteDowntimeCategory.rejected, (state, action) => {
        state.deleting = false;
        state.error =
          action.payload?.message ||
          `Failed to delete ${ENTITY_LABEL}`;
      });
  },
});

// Actions
export const { clearError, resetDowntimeCategories } =
  downtimeCategoriesSlice.actions;

// Selectors
export const selectDowntimeCategories = (state) =>
  state.downtimeCategories.downtimeCategories;
export const selectDowntimeCategoriesLoading = (state) =>
  state.downtimeCategories.loading;
export const selectDowntimeCategoriesError = (state) =>
  state.downtimeCategories.error;
export const selectDowntimeCategoriesCreating = (state) =>
  state.downtimeCategories.creating;
export const selectDowntimeCategoriesUpdating = (state) =>
  state.downtimeCategories.updating;
export const selectDowntimeCategoriesDeleting = (state) =>
  state.downtimeCategories.deleting;
export const selectDowntimeCategoriesPagination = (state) =>
  state.downtimeCategories.pagination;

export default downtimeCategoriesSlice.reducer;


