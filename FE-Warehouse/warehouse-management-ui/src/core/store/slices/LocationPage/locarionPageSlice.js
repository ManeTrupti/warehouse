import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildGetApiUrl, buildPostApiUrl } from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

/* FETCH INVENTORY STOCKS */

export const fetchLocationList = createAsyncThunk(
  "location/fetchStoreList",
  async (
    { page, plant_code = "", page_size, plant_name },
    { rejectWithValue },
  ) => {
    try {
      let url =
        page === 1
          ? buildGetApiUrl(`/warehouse/locations/`)
          : buildGetApiUrl(`/warehouse/locations/?page=${page}`);

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

export const fetchLocationItemCodeList = createAsyncThunk(
  "location/fetchLocationItemCodeList",
  async ({ page = 1, item_code = "", page_size = "" }, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/warehouse/locations/?page_size=${page_size}`);
      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

export const createLocation = createAsyncThunk(
  "location/createLocation",
  async (data, { rejectWithValue }) => {
    try {
      const url = buildPostApiUrl("/warehouse/locations/");
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
  locationList: [],
  locationItemList: [],
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

const locationPageSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocationList.fulfilled, (state, action) => {
        state.loading = false;

        state.locationList = action.payload.results;

        state.pagination = {
          count: action.payload.count,
          total_pages: action.payload.total_pages,
          current_page: action.payload.current_page,
          page_size: action.payload.page_size,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchLocationList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchLocationItemCodeList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocationItemCodeList.fulfilled, (state, action) => {
        state.loading = false;

        state.locationItemList = action.payload;
      })
      .addCase(fetchLocationItemCodeList.rejected, (state, action) => {
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

      .addCase(createLocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { clearError } = locationPageSlice.actions;

export default locationPageSlice.reducer;
