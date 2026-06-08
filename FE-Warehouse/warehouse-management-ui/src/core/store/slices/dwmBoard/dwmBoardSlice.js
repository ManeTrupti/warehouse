import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiService } from '../../../../services/apiService';
import { buildPutApiUrl, buildGetApiUrl } from '../../../../services/apiUtils';

const now = new Date();

// Generic helpers / constants for this entity slice
const ENTITY_KEY = 'dwmBoard';
const ENTITY_LABEL = 'DWM status';
const BASE_STATUS_PATH = 'dwm_board/status-board/?paginate=false';
const BASE_SUMMARY_PATH = 'dwm_board/production-summary/';

const buildErrorPayload = (error, fallback) =>
  error?.response?.data || { message: error?.message || fallback };

const normalizeSqdeStatus = (rawStatus) => {
  if (!rawStatus || typeof rawStatus !== 'object') return {};

  const result = {};

  Object.entries(rawStatus).forEach(([categoryKey, days]) => {
    if (!Array.isArray(days)) return;

    const dayMap = {};
    days.forEach((item) => {
      const day = item?.day;
      const status = item?.status;
      if (!day) return;

      if (status === 'OK') dayMap[day] = 'ok';
      else if (status === 'NOT_OK') dayMap[day] = 'not_ok';
      else if (status === 'NO_PLAN') dayMap[day] = 'no_plan';
      // if null/unknown, leave undefined so UI falls back
    });

    result[categoryKey] = dayMap;
  });

  return result;
};

const initialState = {
  year: now.getFullYear(),
  month: now.getMonth() + 1, // 1-12
  selectedDay: 20,
  // sqdeStatus: { [categoryId]: { [day]: 'ok' | 'not_ok' | 'no_plan' } }
  sqdeStatus: {},
  updating: false,
  statusLoading: false,
  error: null,
  // Production summary table
  summaryType: 'daily', // 'daily' | 'weekly' | 'monthly'
  summary: [],
  summaryLoading: false,
  summaryError: null,
  // Product list for filter
  products: [],
  productsLoading: false,
  productsError: null,
};

export const patchDayStatus = createAsyncThunk(
  `${ENTITY_KEY}/patchDayStatus`,
  async (payload, { rejectWithValue }) => {
    const { date, section, statusApi } = payload;
    try {
      const baseUrl = buildPutApiUrl
        ? buildPutApiUrl(BASE_STATUS_PATH)
        : buildGetApiUrl(BASE_STATUS_PATH);

      const separator = baseUrl.includes('?') ? '&' : '?';
      const url = `${baseUrl}${separator}date=${encodeURIComponent(date)}`;

      const response = await apiService.patch(url, {
        section,
        status: statusApi,
      });

      // if backend returns something useful, we could merge it; for now we just echo payload
      return payload || response.data;
    } catch (error) {
      return rejectWithValue(
        buildErrorPayload(error, `Failed to update ${ENTITY_LABEL}`),
      );
    }
  },
);

export const fetchStatusBoard = createAsyncThunk(
  `${ENTITY_KEY}/fetchStatusBoard`,
  async (_, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(BASE_STATUS_PATH);
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        buildErrorPayload(error, `Failed to fetch ${ENTITY_LABEL}`),
      );
    }
  },
);

export const fetchProductionSummary = createAsyncThunk(
  `${ENTITY_KEY}/fetchProductionSummary`,
  async ({ type, year, month, productId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        type,
        year: String(year),
        month: String(month),
        product_id: String(productId),
      }).toString();
      const baseUrl = buildGetApiUrl(BASE_SUMMARY_PATH);
      const url = `${baseUrl}?${params}`;
      const response = await apiService.get(url);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.results)) return data.results;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    } catch (error) {
      return rejectWithValue(
        buildErrorPayload(error, 'Failed to fetch production summary'),
      );
    }
  },
);

export const fetchProducts = createAsyncThunk(
  `${ENTITY_KEY}/fetchProducts`,
  async (_, { rejectWithValue }) => {
    try {
      // Full URL as requested, bypassing base URL builders
      const url = 'https://planning-api.indi4.io/mdm/product-list/';
      const response = await apiService.get(url);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.results)) return data.results;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    } catch (error) {
      return rejectWithValue(
        buildErrorPayload(error, 'Failed to fetch products'),
      );
    }
  },
);

const dwmBoardSlice = createSlice({
  name: 'dwmBoard',
  initialState,
  reducers: {
    setYear(state, action) {
      state.year = action.payload;
    },
    setMonth(state, action) {
      state.month = action.payload;
    },
    setSelectedDay(state, action) {
      state.selectedDay = action.payload;
    },
    setDayStatus(state, action) {
      const { categoryId, day, status } = action.payload;
      if (!categoryId || !day) return;
      if (!state.sqdeStatus[categoryId]) {
        state.sqdeStatus[categoryId] = {};
      }
      state.sqdeStatus[categoryId][day] = status;
    },
    resetDwmBoard(state) {
      state.year = initialState.year;
      state.month = initialState.month;
      state.selectedDay = initialState.selectedDay;
      state.sqdeStatus = {};
      state.summaryType = initialState.summaryType;
      state.summary = [];
      state.summaryLoading = false;
      state.summaryError = null;
    },
    setSummaryType(state, action) {
      state.summaryType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(patchDayStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(patchDayStatus.fulfilled, (state, action) => {
        state.updating = false;
        const { categoryId, day, status } = action.payload || {};
        if (!categoryId || !day) return;
        if (!state.sqdeStatus[categoryId]) {
          state.sqdeStatus[categoryId] = {};
        }
        state.sqdeStatus[categoryId][day] = status;
        state.error = null;
      })
      .addCase(patchDayStatus.rejected, (state, action) => {
        state.updating = false;
        state.error =
          action.payload?.message || `Failed to update ${ENTITY_LABEL}`;
      })
      .addCase(fetchStatusBoard.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })
      .addCase(fetchStatusBoard.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.sqdeStatus = normalizeSqdeStatus(action.payload);
        state.error = null;
      })
      .addCase(fetchStatusBoard.rejected, (state, action) => {
        state.statusLoading = false;
        state.error =
          action.payload?.message || `Failed to fetch ${ENTITY_LABEL}`;
      })
      .addCase(fetchProductionSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchProductionSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = Array.isArray(action.payload) ? action.payload : [];
        state.summaryError = null;
      })
      .addCase(fetchProductionSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError =
          action.payload?.message || 'Failed to fetch production summary';
      })
      .addCase(fetchProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        const raw = Array.isArray(action.payload) ? action.payload : [];
        // Normalize API shape { product_id, product_name, code } -> { id, name, code }
        state.products = raw.map((item) => ({
          id: item.id ?? item.product_id,
          name: item.name ?? item.product_name,
          code: item.code,
        }));
        state.productsError = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError =
          action.payload?.message || 'Failed to fetch products';
      });
  },
});

export const {
  setYear,
  setMonth,
  setSelectedDay,
  setDayStatus,
  resetDwmBoard,
  setSummaryType,
} = dwmBoardSlice.actions;

// Selectors
export const selectDwmYear = (state) => state.dwmBoard.year;
export const selectDwmMonth = (state) => state.dwmBoard.month;
export const selectDwmSelectedDay = (state) => state.dwmBoard.selectedDay;
export const selectSqdeStatus = (state) => state.dwmBoard.sqdeStatus || {};
export const selectDwmUpdating = (state) => state.dwmBoard.updating;
export const selectStatusBoardLoading = (state) => state.dwmBoard.statusLoading;
export const selectDwmError = (state) => state.dwmBoard.error;
export const selectSummaryType = (state) => state.dwmBoard.summaryType;
export const selectProductionSummary = (state) => state.dwmBoard.summary || [];
export const selectSummaryLoading = (state) => state.dwmBoard.summaryLoading;
export const selectSummaryError = (state) => state.dwmBoard.summaryError;
export const selectProducts = (state) => state.dwmBoard.products || [];
export const selectProductsLoading = (state) =>
  state.dwmBoard.productsLoading;
export const selectProductsError = (state) => state.dwmBoard.productsError;

export default dwmBoardSlice.reducer;

