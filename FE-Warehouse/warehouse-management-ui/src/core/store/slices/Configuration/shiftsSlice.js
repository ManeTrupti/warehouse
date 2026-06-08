import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../../../services/apiService";
import {
  buildGetApiUrl,
  buildPostApiUrl,
  buildPutApiUrl,
  buildDeleteApiUrl,
} from "../../../../services/apiUtils";
import { validateShiftDuration } from "@features/MasterDataManagement/Configuration/Shifts/shiftValidations";

// Generic helpers / constants for this entity slice
const ENTITY_KEY = "shifts";
const ENTITY_LABEL = "shift";
const COLLECTION_LABEL = "shifts";
const BASE_PATH = "/config/shifts/";

const buildFetchError = (error, fallback) =>
  error?.response?.data || { message: error?.message || fallback };

/**
 * Normalize API response to extract the list of items
 * Handles paginated responses (with 'results' array) and plain arrays
 */
const normalizeListResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results; // Paginated response
  if (Array.isArray(data?.items)) return data.items; // Generic items wrapper
  return [];
};

// Async thunks for CRUD operations

/**
 * Fetch all shifts
 */
export const fetchShifts = createAsyncThunk(
  `${ENTITY_KEY}/fetchAll`,
  async (_, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(BASE_PATH);
      const response = await apiService.get(url);
      return normalizeListResponse(response.data);
    } catch (error) {
      return rejectWithValue(
        buildFetchError(error, `Failed to fetch ${COLLECTION_LABEL}`),
      );
    }
  },
);

/**
 * Create a new shift
 */
export const createShift = createAsyncThunk(
  `${ENTITY_KEY}/create`,
  async (shiftData, { rejectWithValue }) => {
    try {
      // Validate 8-hour shift duration
      const validation = validateShiftDuration(
        shiftData.start_time,
        shiftData.end_time,
      );
      if (!validation.isValid) {
        return rejectWithValue({ message: validation.error });
      }

      const url = buildPostApiUrl(BASE_PATH);
      const response = await apiService.post(url, shiftData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        buildFetchError(error, `Failed to create ${ENTITY_LABEL}`),
      );
    }
  },
);

/**
 * Update an existing shift
 */
export const updateShift = createAsyncThunk(
  `${ENTITY_KEY}/update`,
  async ({ id, shiftData }, { rejectWithValue }) => {
    try {
      // Validate 8-hour shift duration
      const validation = validateShiftDuration(
        shiftData.start_time,
        shiftData.end_time,
      );
      if (!validation.isValid) {
        return rejectWithValue({ message: validation.error });
      }

      const url = buildPutApiUrl(`${BASE_PATH}${id}/`);
      const response = await apiService.put(url, shiftData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        buildFetchError(error, `Failed to update ${ENTITY_LABEL}`),
      );
    }
  },
);

/**
 * Delete a shift
 */
export const deleteShift = createAsyncThunk(
  `${ENTITY_KEY}/delete`,
  async (id, { rejectWithValue }) => {
    try {
      const url = buildDeleteApiUrl(`${BASE_PATH}${id}/`);
      await apiService.delete(url);
      return id;
    } catch (error) {
      return rejectWithValue(
        buildFetchError(error, `Failed to delete ${ENTITY_LABEL}`),
      );
    }
  },
);

// Initial state
const initialState = {
  shifts: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

// Slice
const shiftsSlice = createSlice({
  name: "shifts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetShifts: (state) => {
      state.shifts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch shifts
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch shifts";
      });

    // Create shift
    builder
      .addCase(createShift.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.creating = false;
        state.shifts.push(action.payload);
        state.error = null;
      })
      .addCase(createShift.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload?.message || "Failed to create shift";
      });

    // Update shift
    builder
      .addCase(updateShift.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.shifts.findIndex(
          (shift) => shift.id === action.payload.id,
        );
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload?.message || "Failed to update shift";
      });

    // Delete shift
    builder
      .addCase(deleteShift.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.deleting = false;
        state.shifts = state.shifts.filter(
          (shift) => shift.id !== action.payload,
        );
        state.error = null;
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload?.message || "Failed to delete shift";
      });
  },
});

// Actions
export const { clearError, resetShifts } = shiftsSlice.actions;

// Selectors
export const selectShifts = (state) => state.shifts.shifts;
export const selectShiftsLoading = (state) => state.shifts.loading;
export const selectShiftsError = (state) => state.shifts.error;
export const selectShiftsCreating = (state) => state.shifts.creating;
export const selectShiftsUpdating = (state) => state.shifts.updating;
export const selectShiftsDeleting = (state) => state.shifts.deleting;

export default shiftsSlice.reducer;
