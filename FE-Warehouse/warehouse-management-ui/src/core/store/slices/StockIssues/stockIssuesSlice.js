import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildGetApiUrl, buildPostApiUrl } from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

/* FETCH INVENTORY STOCKS */

export const fetchStocksIssuesList = createAsyncThunk(
  "stockIssues/fetchStocksIssuesList",
  async ({page,  plant_code = "", page_size, plant_name}, { rejectWithValue }) => {
    try {
      let url = page === 1 ? buildGetApiUrl(`/warehouse/plants/`) : buildGetApiUrl(`/warehouse/plants/?page=${page}`);

      if (plant_code) {
        url +=  page === 1 ? `?plant_code=${plant_code}` : `&plant_code=${plant_code}`;
      }
       if (plant_name) {
        url +=  page === 1 ? `?plant_name=${plant_name}` : `&plant_name=${plant_name}`;
      }
      if (page_size) {
        url += `&page_size=${page_size}`;
      }

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching  Stock Issues" }
      );
    }
  }
);

export const fetchStocksIssuesItemCodeList = createAsyncThunk(
  "stockIssues/fetchStocksIssuesItemCodeList",
  async ({ page = 1, item_code = "", page_size = "" }, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/warehouse/plants/?page_size=${page_size}`);
      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" }
      );
    }
  }
);

export const createStockIssue = createAsyncThunk(
  "stockIssues/createStockIssue",
  async (data, { rejectWithValue }) => {
    try {
      const url = buildPostApiUrl("/warehouse/plants/");
      const response = await apiService.post(url, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
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
        error?.response?.data || { message: "Error uploading inventory stock" }
      );
    }
  }
);

const initialState = {
  stockIssuesList: [],
  stockIssuesItemList:[],
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

const stockIssuesSlice = createSlice({
  name: "stockIssues",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchStocksIssuesList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStocksIssuesList.fulfilled, (state, action) => {
        state.loading = false;

        state.stockIssuesList = action.payload.results;

        state.pagination = {
          count: action.payload.count,
          total_pages: action.payload.total_pages,
          current_page: action.payload.current_page,
          page_size: action.payload.page_size,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchStocksIssuesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })



      .addCase(fetchStocksIssuesItemCodeList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStocksIssuesItemCodeList.fulfilled, (state, action) => {
        state.loading = false;

        state.stockIssuesItemList = action.payload;
      })
      .addCase(fetchStocksIssuesItemCodeList.rejected, (state, action) => {
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

      


      
      .addCase(createStockIssue.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStockIssue.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createStockIssue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});


export const { clearError } = stockIssuesSlice.actions;

export default stockIssuesSlice.reducer;
