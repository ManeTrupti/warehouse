
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildGetApiUrl, buildInventoryGetApiUrl, buildPostApiUrl } from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

// Fetch Requisition Data
export const fetchRequisitionData = createAsyncThunk(
  "requisition/fetchRequisitionData",
  async ({ page, page_size }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (page) params.set("page", String(page));
      if (page_size) params.set("page_size", String(page_size));

      const query = params.toString();

      const url = buildGetApiUrl(
        `/warehouse/requisition/${query ? `?${query}` : ""}`
      );

      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching requisition data" }
      );
    }
  }
);

// Create Requisition
export const createRequisition = createAsyncThunk(
  "requisition/createRequisition",
  async (data, { rejectWithValue }) => {
  
    try {
      const url = buildPostApiUrl("/warehouse/requisition/");
      // const response = await apiService.post(`http://supreme-warehouse.indi4.io:8000/api/warehouse/requisition/`, data);
      const response = await apiService.post(url, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateRequisitionQty = createAsyncThunk(
  "requisition/updateRequisitionQty",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const url = buildPostApiUrl(`/warehouse/requisition/${id}/`);
      const response = await apiService.patch(url, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error updating requisition quantity" },
      );
    }
  },
);


// Create Requisition
export const createRequisitionIssue = createAsyncThunk(
  "requisitionIssue/createRequisitionIssue",
  async (data, { rejectWithValue }) => {

    try {
      const url = buildPostApiUrl("/warehouse/requisition/issue/");
      // const response = await apiService.post(`http://supreme-warehouse.indi4.io:8000/api/warehouse/requisition/`, data);
      const response = await apiService.post(url, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


const initialState = {
   requisitionList:[],
  requisitionData: [],
 
  
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

const requisitionSlice = createSlice({
  name: "requisition",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
       // requisition data fetching
    .addCase(fetchRequisitionData.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchRequisitionData.fulfilled, (state, action) => {
      state.loading = false;

      state.requisitionList =
        action.payload.results || action.payload.data || [];

      state.pagination = {
        count: action.payload.count,
        total_pages: action.payload.total_pages,
        current_page: action.payload.current_page,
        page_size: action.payload.page_size,
        next: action.payload.next,
        previous: action.payload.previous,
      };
    })
    .addCase(fetchRequisitionData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message;
    })



      // requisition creation
      .addCase(createRequisition.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRequisition.fulfilled, (state, action) => {
        state.loading = false;
       
      })
      .addCase(createRequisition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(updateRequisitionQty.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRequisitionQty.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateRequisitionQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


    
  },
});

export const { clearError } = requisitionSlice.actions;
export default requisitionSlice.reducer;