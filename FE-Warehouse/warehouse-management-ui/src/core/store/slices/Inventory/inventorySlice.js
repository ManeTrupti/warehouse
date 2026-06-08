import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildGetApiUrl } from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

/* FETCH INVENTORY STOCKS */

export const fetchInventoryStocks = createAsyncThunk(
  "inventory/fetchInventoryStocks",
  async ({ page = 1, item_code = "", page_size = "" }, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/inventory-stock/?page=${page}`);

      if (item_code) {
        url += `&item_code=${item_code}`;
      }
      if (page_size) {
        url += `&page_size=${page_size}`;
      }

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" }
      );
    }
  }
);

export const fetchInventoryItemCodes = createAsyncThunk(
  "inventory/fetchInventoryItemCodes",
  async ({ page = 1, item_code = "", page_size = "" }, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/inventory-stock/?page=${page}&page_size=${page_size}`);
      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" }
      );
    }
  }
);

const initialState = {
  inventoryStock: [],
  inventoryItemCodes:[],
  loading: false,
  error: null,

  pagination: {
    count: 0,
    total_pages: 0,
    current_page: 1,
    page_size: 10,
    next: null,
    previous: null,
  },
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryStocks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryStocks.fulfilled, (state, action) => {
        state.loading = false;

        state.inventoryStock = action.payload.results || action.payload;

        state.pagination = {
          count: action.payload.count,
          total_pages: action.payload.total_pages,
          current_page: action.payload.current_page,
          page_size: action.payload.page_size,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchInventoryStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })



      .addCase(fetchInventoryItemCodes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryItemCodes.fulfilled, (state, action) => {
        state.loading = false;

        state.inventoryItemCodes = action.payload;
      })
      .addCase(fetchInventoryItemCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});


export default inventorySlice.reducer;
