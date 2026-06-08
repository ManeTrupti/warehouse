import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildGetApiUrl, buildPostApiUrl } from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

/* FETCH INVENTORY STOCKS */

export const fetchWarehouseList = createAsyncThunk(
  "warehouse/fetchWarehouseList",
  async (
    { page, plant_code = "", page_size, plant_name },
    { rejectWithValue },
  ) => {
    try {
      let url =
        page === 1
          ? buildGetApiUrl(`/warehouse/warehouses/`)
          : buildGetApiUrl(`/warehouse/warehouses/?page=${page}`);

      if (plant_code) {
        url +=
          page === 1
            ? `?code=${plant_code}`
            : `&code=${plant_code}`;
      }
      if (plant_name) {
        url +=
          page === 1
            ? `?name=${plant_name}`
            : `&name=${plant_name}`;
      }
      if (page_size) {
        url += `&page_size=${page_size}`;
      }

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching  Stock Issues" },
      );
    }
  },
);

export const fetchWarehouseItemCodeList = createAsyncThunk(
  "warehouse/fetchWarehouseItemCodeList",
  async ({ page = 1, item_code = "", page_size = "" }, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/warehouse/warehouses/?page_size=${page_size}`);
      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

export const createWarehouse = createAsyncThunk(
  "warehouse/createWarehouse",
  async (data, { rejectWithValue }) => {
    try {
      const url = buildPostApiUrl("/warehouse/warehouses/");
      const response = await apiService.post(url, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const uploadInventoryExcel = createAsyncThunk(
  "inventory/uploadInventoryExcel",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      let url = buildPostApiUrl(`/upload-excel/`);

      const response = await apiService.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error uploading inventory stock" },
      );
    }
  },
);

const initialState = {
  warehouseList: [],
  warehouseItemList: [],
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

const warehousePageSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouseList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehouseList.fulfilled, (state, action) => {
        state.loading = false;

        state.warehouseList = action.payload.results;

        state.pagination = {
          count: action.payload.count,
          total_pages: action.payload.total_pages,
          current_page: action.payload.current_page,
          page_size: action.payload.page_size,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchWarehouseList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchWarehouseItemCodeList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehouseItemCodeList.fulfilled, (state, action) => {
        state.loading = false;

        state.warehouseItemList = action.payload;
      })
      .addCase(fetchWarehouseItemCodeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(uploadInventoryExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadInventoryExcel.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(uploadInventoryExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(createWarehouse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearError } = warehousePageSlice.actions;

export default warehousePageSlice.reducer;
