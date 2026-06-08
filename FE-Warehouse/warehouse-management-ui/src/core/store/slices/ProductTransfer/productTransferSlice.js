import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildGetApiUrl, buildPostApiUrl } from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

export const createProductTransfer = createAsyncThunk(
  "productTransfer/createProductTransfer",
  async (data, { rejectWithValue }) => {
    try {
      const url = buildPostApiUrl("/warehouse/product-transfer/");
      const response = await apiService.post(url, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error creating product transfer" },
      );
    }
  },
);

export const fetchProductTransferList = createAsyncThunk(
  "stockRequest/fetchProductTransferList",
  async (
    { page, plant_code = "", page_size, plant_name },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (page) params.set("page", String(page));
      if (page_size) params.set("page_size", String(page_size));
      if (plant_code) params.set("plant_code", plant_code);
      if (plant_name) params.set("plant_name", plant_name);
      const query = params.toString();
      const url = buildGetApiUrl(
        `/warehouse/product-transfer/${query ? `?${query}` : ""}`,
      );

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching  Stock Issues" },
      );
    }
  },
);

export const fetchProductTransferTypeList = createAsyncThunk(
  "stockRequest/fetchProductTransferTypeList",
  async (
    { transfer_type},
    { rejectWithValue },
  ) => {
    try {
      let url = buildGetApiUrl(`/transfer-dropdowns/?transfer_type=${transfer_type}`);


      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching  Stock Issues" },
      );
    }
  },
);

export const fetchWarehouseInventoryStockProducts = createAsyncThunk(
  "productTransfer/fetchWarehouseInventoryStockProducts",
  async (
    { search = "", page_size = "all", product_code = "", sub_inventory="" } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (page_size) params.set("page_size", String(page_size));
      if (search) params.set("search", search);
      if (product_code) params.set("product_code", product_code);
      if (sub_inventory) params.set("sub_inventory", sub_inventory);
      const query = params.toString();
      const url = buildGetApiUrl(
        `/warehouse/inventory-stock/${query ? `?${query}` : ""}`,
      );

      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Error fetching warehouse inventory stock",
        },
      );
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  productTransferList: [],
  transferTypeList: [],
  transferTypeLoading: null,
  inventoryStockProducts: [],
  inventoryStockProductsLoading: false,
  submitLoading: null,
  pagination: {
    count: 0,
    total_pages: 0,
    current_page: 1,
    page_size: 10,
    next: null,
    previous: null,
  },
};

const productTransferSlice = createSlice({
  name: "productTransfer",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.transferTypeLoading = null;
      state.submitLoading = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProductTransfer.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(createProductTransfer.fulfilled, (state) => {
        state.submitLoading = false;
      })
      .addCase(createProductTransfer.rejected, (state, action) => {
        state.submitLoading = false;
        state.error =
          action.payload?.message ||
          (typeof action.payload === "string" ? action.payload : null) ||
          "Error creating product transfer";
      })

      .addCase(fetchProductTransferList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductTransferList.fulfilled, (state, action) => {
        state.loading = false;
        state.productTransferList = action.payload.results || action.payload.data || [];

        state.pagination = {
          count: action.payload.count,
          total_pages: action.payload.total_pages,
          current_page: action.payload.current_page,
          page_size: action.payload.page_size,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchProductTransferList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      .addCase(fetchProductTransferTypeList.pending, (state) => {
        state.transferTypeLoading = true;
      })
      .addCase(fetchProductTransferTypeList.fulfilled, (state, action) => {
        state.transferTypeLoading = false;
        state.transferTypeList = action.payload.data;
  
      })
      .addCase(fetchProductTransferTypeList.rejected, (state, action) => {
        state.transferTypeLoading = false;
        state.error = action.payload?.error;
      });

    builder
      .addCase(fetchWarehouseInventoryStockProducts.pending, (state) => {
        state.inventoryStockProductsLoading = true;
      })
      .addCase(fetchWarehouseInventoryStockProducts.fulfilled, (state, action) => {
        state.inventoryStockProductsLoading = false;
        const payload = action.payload;
        state.inventoryStockProducts =
          payload?.results || payload?.data || payload || [];
      })
      .addCase(fetchWarehouseInventoryStockProducts.rejected, (state, action) => {
        state.inventoryStockProductsLoading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearError } = productTransferSlice.actions;

export default productTransferSlice.reducer;
