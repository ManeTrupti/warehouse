import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildGetApiUrl, buildPostApiUrl } from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

/* FETCH INVENTORY STOCKS */

export const fetchStoreList = createAsyncThunk(
  "storePage/fetchStoreList",
  async (
    { page, plant_code = "", page_size, plant_name },
    { rejectWithValue },
  ) => {
    try {
      let url =
        page === 1
          ? buildGetApiUrl(`/warehouse/stores/`)
          : buildGetApiUrl(`/warehouse/stores/?page=${page}`);

      if (plant_code) {
        url +=
          page === 1
            ? `?plant_code=${plant_code}`
            : `&plant_code=${plant_code}`;
      }
      if (plant_name) {
        url +=
          page === 1
            ? `?plant_name=${plant_name}`
            : `&plant_name=${plant_name}`;
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

export const fetchStorePageItemCodeList = createAsyncThunk(
  "storePage/fetchStorePageItemCodeList",
  async ({ page = 1, item_code = "", page_size = "" }, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/warehouse/stores/?page_size=${page_size}`);
      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

export const createStore = createAsyncThunk(
  "storePage/createStore",
  async (data, { rejectWithValue }) => {
    try {
      const url = buildPostApiUrl("/warehouse/stores/");
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
  storePageList: [],
  storePageItemList: [],
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

const storePageSlice = createSlice({
  name: "storePage",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStoreList.fulfilled, (state, action) => {
        state.loading = false;

        state.storePageList = action.payload.results;

        state.pagination = {
          count: action.payload.count,
          total_pages: action.payload.total_pages,
          current_page: action.payload.current_page,
          page_size: action.payload.page_size,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchStoreList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchStorePageItemCodeList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStorePageItemCodeList.fulfilled, (state, action) => {
        state.loading = false;

        state.storePageItemList = action.payload;
      })
      .addCase(fetchStorePageItemCodeList.rejected, (state, action) => {
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

      .addCase(createStore.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearError } = storePageSlice.actions;

export default storePageSlice.reducer;
