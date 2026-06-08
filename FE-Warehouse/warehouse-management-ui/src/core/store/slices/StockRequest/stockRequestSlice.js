import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildGetApiUrl, buildInventoryGetApiUrl, buildPostApiUrl } from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

/* FETCH INVENTORY STOCKS */

export const fetchInwardList = createAsyncThunk(
  "stockRequest/fetchInwardList",
  async ({page,  plant_code = "", page_size, plant_name}, { rejectWithValue }) => {
    try {
      let url = page === 1 ? buildGetApiUrl(`/warehouse/inward/`) : buildGetApiUrl(`/warehouse/inward/?page=${page}`);

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


export const updateInwardItem = createAsyncThunk(
  "stockRequest/updateInwardItem",
  async ({payload, id}, { rejectWithValue }) => {
    try {
      // let url = page === 1 ? buildGetApiUrl(`/warehouse/inward/`) : buildGetApiUrl(`/warehouse/inward/?page=${page}`);
      const response = await apiService.patch(`https://neosoft-warehouse-test.indi4.io/api/warehouse/inward-item/${id}/`,payload);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching  Stock Issues" }
      );
    }
  }
)

export const fetchInwardDashboard = createAsyncThunk(
  "stockRequest/fetchInwardDashboard",
  async (_, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/warehouse/inward/dashboard/`);
      const response = await apiService.get(url);
      console.log("inward dashboard",response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" }
      );
    }
  }
);

export const createInward = createAsyncThunk(
  "stockRequest/createInward",
  async (data, { rejectWithValue }) => {
    try {
      const url = buildPostApiUrl("/warehouse/inward/");
      const response = await apiService.post(url, data);
      // const response = await apiService.post(`https://neosoft-warehouse-test.indi4.io/api/warehouse/inward/`,payload);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAvailableStockQty = createAsyncThunk(
  "stockRequest/fetchAvailableStockQty",
  async (payload, { rejectWithValue }) => {
    try {
       const url = buildPostApiUrl("/warehouse/fetch-inventory-stock/")
      const response = await apiService.post(url,payload,);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching available quantity" },
      );
    }
  },
);


export const fetchInventoryProducts = createAsyncThunk(
  "stockRequest/fetchInventoryProducts",
  async (data, { rejectWithValue }) => {
    try {
      // const url = buildInventoryGetApiUrl("/inventory-stock/?page_size=all",);
      const url = "https://neosoft-inventory-test.c4i4.org/api/inventory-stock/";
      const response = await apiService.get(url, data);
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
  inwardList: [],
  inwardDashboardData:[],
  inventoryProductList:[],
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

const stockRequestSlice = createSlice({
  name: "stockRequest",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchInwardList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInwardList.fulfilled, (state, action) => {
        state.loading = false;
        state.inwardList = action.payload.data;

        state.pagination = {
          count: action.payload.count,
          total_pages: action.payload.total_pages,
          current_page: action.payload.current_page,
          page_size: action.payload.page_size,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchInwardList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })



      .addCase(fetchInwardDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInwardDashboard.fulfilled, (state, action) => {
        state.loading = false;

        state.inwardDashboardData = action.payload.data;
      })
      .addCase(fetchInwardDashboard.rejected, (state, action) => {
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

      


      
      .addCase(createInward.pending, (state) => {
        state.loading = true;
      })
      .addCase(createInward.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createInward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      .addCase(fetchInventoryProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventoryProducts.fulfilled, (state, action) => {
        state.loading = false;

        state.inventoryProductList = action.payload;
      })
      .addCase(fetchInventoryProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })



      .addCase(updateInwardItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInwardItem.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateInwardItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});


export const { clearError } = stockRequestSlice.actions;

export default stockRequestSlice.reducer;
