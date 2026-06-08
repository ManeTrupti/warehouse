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

      const response = await apiService.get(`https://neosoft-warehouse-test.indi4.io/api/warehouse/inward/`);

      return response.data;
      
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching  Stock Issues" }
      );
    }
  }
);



export const fetchRackAllocationData = createAsyncThunk(
  
  "rackAllocation/fetchRackAllocationData",
  async (
    {
      product_code,
      productCode,
      search,
      page,
      page_size,
      pageSize,
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const code = product_code || productCode || "";
      const q = search || "";
      const pageNumber = page || "";
      const size = page_size || pageSize || "";
      const params = new URLSearchParams();
      if (code) params.set("product_code", code);
      if (q) params.set("search", q);
      if (pageNumber) params.set("page", String(pageNumber));
      if (size) params.set("page_size", String(size));
      const query = params.toString();

      const basePath = `/warehouse/allocations/${query ? `?${query}` : ""}`;
      const url = buildGetApiUrl(basePath);
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" }
      );
    }
  }
);

export const fetchRackAllocationStatus = createAsyncThunk(
  "rackAllocation/fetchRackAllocationStatus",
  async ({ search, page, page_size, pageSize } = {}, { rejectWithValue }) => {
    try {
      const q = search || "";
      const pageNumber = page || "";
      const size = page_size || pageSize || "";
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (pageNumber) params.set("page", String(pageNumber));
      if (size) params.set("page_size", String(size));
      const query = params.toString();

      let url = buildGetApiUrl(
        `/warehouse/allocation-status/${query ? `?${query}` : ""}`,
      );
      const response = await apiService.get(url);
      // const response = await apiService.get(`https://neosoft-warehouse-test.indi4.io/api/warehouse/allocation-status/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" }
      );
    }
  }
);

export const createRackAllocation = createAsyncThunk(
  "rackAllocation/createRackAllocation",
  async (data, { rejectWithValue }) => {
  
    try {
      const url = buildPostApiUrl("/warehouse/allocations/");
      const response = await apiService.post(url, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);



const initialState = {
  inwardList: [],
  rackAllocationData: [],
  rackAllocationList:[],
  rackAllocationStatusList: [],
  
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

const rackAllocationSlice = createSlice({
  name: "rackAllocation",
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


            // rack allocation data fetching
      .addCase(fetchRackAllocationData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRackAllocationData.fulfilled, (state, action) => {
        state.loading = false;
        state.rackAllocationList = action.payload;

         state.pagination = {
          count: action.payload.count,
          total_pages: action.payload.total_pages,
          current_page: action.payload.current_page,
          page_size: action.payload.page_size,
          next: action.payload.next,
          previous: action.payload.previous,
        };
      })
      .addCase(fetchRackAllocationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      .addCase(fetchRackAllocationStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRackAllocationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.rackAllocationStatusList = action.payload.data;
      })
      .addCase(fetchRackAllocationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })



    
      


      // rack allocation creation
      .addCase(createRackAllocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRackAllocation.fulfilled, (state, action) => {
        state.loading = false;
       
      })
      .addCase(createRackAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


    
  },
});


export const { clearError } = rackAllocationSlice.actions;

export default rackAllocationSlice.reducer;
