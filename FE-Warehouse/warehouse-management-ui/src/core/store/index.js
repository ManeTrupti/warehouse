import { configureStore } from "@reduxjs/toolkit";
import dwmBoardReducer from "./slices/dwmBoard/dwmBoardSlice";

import shiftsReducer from "./slices/Configuration/shiftsSlice";
import shiftUpdateReducer from "./slices/ShiftUpdate/shiftUpdateSlice";
import rejectionReasonsReducer from "./slices/Configuration/rejectionReasonsSlice";
import downtimeCategoriesReducer from "./slices/Configuration/downtimeCategoriesSlice";
import downtimeReasonsReducer from "./slices/Configuration/downtimeReasonsSlice";
import breakdownsReducer from "./slices/Configuration/breakdownsSlice";
import productionLossReasonsReducer from "./slices/Configuration/productionLossReasonsSlice";
import productionPlanningReducer from "./slices/ProductionPlanning/productionPlanningSlice";
import breakdownReducer from "@core/store/slices/Breakdown/breakdownSlice";
import factoryOverviewReducer from "@core/store/slices/factoryOverview/factoryOverviewSlice";
// import factoryOverviewReducer from "@core/store/slices/BrekdownDashboard/factoryOverviewSlice";
import centerReducer from "@core/store/slices/BrekdownDashboard/centerSlice";
import ticketCenterReducer from "@core/store/slices/BrekdownDashboard/ticketCenterSlice";

import reportsReducer from "./slices/Reports/reportsSlice";
import stockIssuesReducer from "./slices/StockIssues/stockIssuesSlice"
import storePageReducer from "./slices/StorePage/storePageSlice"
import StockRequestReducer from "./slices/StockRequest/stockRequestSlice";
import productTransferReducer from "./slices/ProductTransfer/productTransferSlice";
import LocationReducer from "./slices/LocationPage/locarionPageSlice"
import WarehouseReducer from "./slices/WarehousePage/warehousePageSlice"
import MDMReducer from "./slices/MDM/mdmSlice"
import RackAllocationReducer from "./slices/RackAllocation/rackAllocationSlice"
import RequisitionReducer from "./slices/Requisition/requisitionSlice";


export const store = configureStore({
  reducer: {
    shifts: shiftsReducer,
    shiftUpdate: shiftUpdateReducer,
    rejectionReasons: rejectionReasonsReducer,
    downtimeCategories: downtimeCategoriesReducer,
    dwmBoard: dwmBoardReducer,
    downtimeReasons: downtimeReasonsReducer,
    breakdowns: breakdownsReducer,
    productionLossReasons: productionLossReasonsReducer,
    productionPlanning: productionPlanningReducer,
    breakdown: breakdownReducer,
    factoryOverview: factoryOverviewReducer,
    reports: reportsReducer,
    center: centerReducer,
    ticketCenter: ticketCenterReducer,
    stockIssues: stockIssuesReducer,
    storePage: storePageReducer,
    stockRequest: StockRequestReducer,
    productTransfer: productTransferReducer,
    location: LocationReducer,
    warehouse: WarehouseReducer,
    mdm: MDMReducer,
    rackAllocation: RackAllocationReducer,
    requisition: RequisitionReducer,  


  },
});

export default store;
