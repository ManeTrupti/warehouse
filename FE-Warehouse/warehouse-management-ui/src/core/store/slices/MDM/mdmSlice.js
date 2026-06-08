


import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildGetApiUrl, buildPostApiUrl } from "../../../../services/apiUtils";
import { apiService } from "../../../../services/apiService";

/* FETCH INVENTORY STOCKS */

export const fetchLocationCodeList = createAsyncThunk(
  "mdm/fetchLocationCodeList",
  async ({ page_size = "" }, { rejectWithValue }) => {
    try {
        let url = buildGetApiUrl("/warehouse/mdm-locations/");
    //   const response = await apiService.get(`/warehouse/locations/?page_size=${page_size}`);
      const response = await apiService.get("https://neosoft-warehouse-test.indi4.io/api/warehouse/mdm-locations/"); 
      // console.log("location",response.data);     
      return response.data;
      
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

export const fetchPlantsList = createAsyncThunk(
  "mdm/fetchPlantsList",
  async ({search}, { rejectWithValue }) => {
    try {
        let url = buildGetApiUrl(`/warehouse/mdm-plants/?search=${search}`);
        // const response = await apiService.get(`https://neosoft-warehouse-test.indi4.io/api/warehouse/mdm-plants/?search=${search}`);
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

export const fetchSubInventoriesList = createAsyncThunk(
  "mdm/fetchSubInventoriesList",
  async ({search}, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/warehouse/mdm-subinventories/?search=${search}`);
      // const response = await apiService.get("https://neosoft-warehouse-test.indi4.io/api/warehouse/mdm-subinventories/?search=${search}");
    const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

export const fetchZonesList = createAsyncThunk(
  "mdm/fetchZonesList",
  async ({ page_size = "", search = "" } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (page_size) query.set("page_size", page_size);
      if (search) query.set("search", search);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      const url = buildGetApiUrl(`/warehouse/mdm-zones/${suffix}`);
      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

// aisle fetch data 
export const fetchAislesList = createAsyncThunk(
  "mdm/fetchAislesList",
  async ({ page_size = "", search = "" } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (page_size) query.set("page_size", page_size);
      if (search) query.set("search", search);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      const url = buildGetApiUrl(`/warehouse/mdm-aisles/${suffix}`);
      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);


// fetch racklist data

export const fetchRacksList = createAsyncThunk(
  "mdm/fetchRacksList",
  async ({ page_size = "", search = "" } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (page_size) query.set("page_size", page_size);
      if (search) query.set("search", search);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      const url = buildGetApiUrl(`/warehouse/mdm-racks/${suffix}`);
      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

// fetch bin list data

export const fetchBinsList = createAsyncThunk(
  "mdm/fetchBinsList",
  async ({ page_size = "", search = "" } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (page_size) query.set("page_size", page_size);
      if (search) query.set("search", search);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      const url = buildGetApiUrl(`/warehouse/mdm-bins/${suffix}`);
      const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

// fetch workstation list data
export const fetchWorkstationsList = createAsyncThunk(
  "mdm/fetchWorkstationsList",
  async ({search}, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/mdm-workstations-list/?search=${search}`);
      // const response = await apiService.get("http://supreme-warehouse.indi4.io:8000/api/mdm-workstations-list/");
    const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);


export const fetchSubZonesList = createAsyncThunk(
  "mdm/fetchSubZonesList",
  async ({ page_size = "" }, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/warehouse/mdm-subzones/`);
      // const response = await apiService.get("https://neosoft-warehouse-test.indi4.io/api/warehouse/mdm-subzones/");
    const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

export const fetchProductList = createAsyncThunk(
  "mdm/fetchProductList",
  async ({ search = "", type } = {}, { rejectWithValue }) => {
    try {
      const url = buildGetApiUrl(`/warehouse/mdm-products/`);
      const params = {};
      if (search) params.search = search;
      if (type) params.type = type;

      const response = await apiService.get(url, { params });
    // const response = await apiService.get(`/mdm/products/?page_size=${page_size}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

export const fetchRMProductList = (payload = {}) =>
  fetchProductList({ ...payload, type: "RM" });


export const fetchSuppliersList = createAsyncThunk(
  "mdm/fetchSuppliersList",
  async ({ page_size = "", search }, { rejectWithValue }) => {
    try {
      let url = buildGetApiUrl(`/warehouse/mdm-suppliers/?search=${search}`);
      // const response = await apiService.get("https://neosoft-warehouse-test.indi4.io/api/warehouse/mdm-suppliers/?search=${search}");
    const response = await apiService.get(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

export const fetchInventoryStockLines = createAsyncThunk(
  "mdm/fetchInventoryStockLines",
  async (_, { rejectWithValue }) => {
    try {
      const url = "https://neosoft-inventory-test.c4i4.org/api/inventory-stock/";
      const response = await apiService.get(url);
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : raw?.results || raw?.data || [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Error fetching inventory stock" },
      );
    }
  },
);

const initialState = {
  locationList: [],
  plantList: [],
  subInventoriesList: [],
  zoneList: [],
  aisleList: [],
  rackList: [],
  binList: [],
  workstationsList: [],
  subZoneList: [],
  productList:[],
  suppliersList:[],
  inventoryStockLines: [],
  inventoryStockLoading: false,
  loading: false,
  error: null,
};

const mdmSlice = createSlice({
  name: "mdm",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationCodeList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocationCodeList.fulfilled, (state, action) => {
        state.loading = false;

        state.locationList = action.payload;
      })
      .addCase(fetchLocationCodeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      .addCase(fetchPlantsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlantsList.fulfilled, (state, action) => {
        state.loading = false;

        state.plantList = action.payload;
      })
      .addCase(fetchPlantsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      .addCase(fetchSubInventoriesList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubInventoriesList.fulfilled, (state, action) => {
        state.loading = false;

        state.subInventoriesList = action.payload;
      })
      .addCase(fetchSubInventoriesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      .addCase(fetchZonesList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchZonesList.fulfilled, (state, action) => {
        state.loading = false;

        state.zoneList = action.payload;
      })
      .addCase(fetchZonesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // aisle list

        .addCase(fetchAislesList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAislesList.fulfilled, (state, action) => {
        state.loading = false;

        state.aisleList = action.payload;
      })
      .addCase(fetchAislesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      // rack list

         .addCase(fetchRacksList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRacksList.fulfilled, (state, action) => {
        state.loading = false;

        state.rackList = action.payload;
      })
      .addCase(fetchRacksList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


        // bin list

           .addCase(fetchBinsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBinsList.fulfilled, (state, action) => {
        state.loading = false;

        state.binList = action.payload;
      })
      .addCase(fetchBinsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

// workstation list
      .addCase(fetchWorkstationsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkstationsList.fulfilled, (state, action) => {
        state.loading = false;

        state.workstationsList = action.payload;
      })
      .addCase(fetchWorkstationsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      .addCase(fetchSubZonesList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubZonesList.fulfilled, (state, action) => {
        state.loading = false;

        state.subZoneList = action.payload;
      })
      .addCase(fetchSubZonesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      .addCase(fetchProductList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductList.fulfilled, (state, action) => {
        state.loading = false;

        state.productList = action.payload;
      })
      .addCase(fetchProductList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })


      .addCase(fetchSuppliersList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSuppliersList.fulfilled, (state, action) => {
        state.loading = false;

        state.suppliersList = action.payload;
      })
      .addCase(fetchSuppliersList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchInventoryStockLines.pending, (state) => {
        state.inventoryStockLoading = true;
      })
      .addCase(fetchInventoryStockLines.fulfilled, (state, action) => {
        state.inventoryStockLoading = false;
        state.inventoryStockLines = action.payload;
      })
      .addCase(fetchInventoryStockLines.rejected, (state) => {
        state.inventoryStockLoading = false;
        state.inventoryStockLines = [];
      });
  },
});

export const { clearError } = mdmSlice.actions;

export default mdmSlice.reducer;
