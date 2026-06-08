import Dashboard from './Dashboard/Dashnoard.component';
import Productionplanning from './ProductionPlaning/ProductionPlanning.component';
import StockRequest from '@features/stockRequest/StockRequest';
// import InventoryPage from '@features/inventory/Inventory';
// import MastersPage from '@features/masters/MasterPage';
import StockIssues from '@features/stockIssues/StockIssues';
import ProductTransfer from '@features/productTransfer/ProductTransfer';
import Requisition from '@features/requisition/Requisition';
import LoginPage from '../Login/Login.component';
import RackAllocation from '@features/rackAllocation/RackAllocation';


export const productionDataRoutes = [
  { path: '/', element: <LoginPage /> },
  { path: '/reports', element: <Dashboard /> },
  // { path: '/inventory', element: <InventoryPage /> },
  // { path: '/masters', element: <MastersPage /> },
  { path: '/stock-requests', element: <StockRequest /> },
  { path: '/rack-allocation', element: <RackAllocation /> },
  // { path: '/masters/stock-issues', element: <StockIssues /> },
  { path: '/product-transfer', element: <ProductTransfer /> },
  { path: '/requisition', element: <Requisition /> },
  { path: '/stock-issue', element: <StockIssues /> },
];

