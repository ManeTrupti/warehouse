import {
    TableCellsIcon,
    RectangleStackIcon,
    ComputerDesktopIcon,
    CubeIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    ArrowDownTrayIcon,
    CalendarIcon,
    DocumentIcon,
    ExclamationTriangleIcon,
    Squares2X2Icon,
    QuestionMarkCircleIcon,
    CubeTransparentIcon,
    ChartBarSquareIcon,
    SignalIcon,
    InboxIcon,
    SquaresPlusIcon,
} from '@heroicons/react/24/outline';

export const MenuIcons = {
    
    'configuration': <Cog6ToothIcon className="w-5 h-5" />,
    'kpi-dashboard': <ChartBarIcon className="w-5 h-5" />,
    'dashboard': <ChartBarSquareIcon className="w-5 h-5" />,
    'stock-requests': <DocumentTextIcon className="w-5 h-5" />,
    'rack-allocation': <RectangleStackIcon className="w-5 h-5" />,
    'inventory': <CalendarIcon className="w-5 h-5" />,
    'stock-issues': <ClipboardDocumentCheckIcon className="w-5 h-5" />,
    'assembly-feasibility': <CubeIcon className="w-5 h-5" />,
    'dwm-board': <InboxIcon className="w-5 h-5" />,
    'breakdown-dashboard': <ExclamationTriangleIcon className="w-5 h-5" />,
    'reports': <DocumentIcon className="w-5 h-5" />,
    'user-management': <SquaresPlusIcon className="w-5 h-5" />,
   
};

/**
 * SideBar Data menu items
 */
export const PRODUCTION_DATA_ITEMS = [
    // { id: 'inventory', label: 'Inventory', path: '/inventory', icon: MenuIcons['inventory'] },
    // { id: 'masters', label: 'Masters', path: '/masters', icon: MenuIcons['user-management'] },
    { id: 'stock-requests', label: 'Stock Inward', path: '/stock-requests', icon: MenuIcons['stock-requests'] },
    { id: 'rack-allocation', label: 'Rack-Allocation', path: '/rack-allocation', icon: MenuIcons['rack-allocation'] },
    { id: 'product-transfer', label: 'Product Transfer', path: '/product-transfer', icon: MenuIcons['stock-issues'] },
    { id: 'requisition', label: 'Requisition', path: '/requisition', icon: MenuIcons['reports'] },
    {id: "stock-issue", label:"Stock Issue", path: "/stock-issue",  icon: MenuIcons['stock-issues']},
    {id:'dashboard', label: 'Reports', path: '/reports', icon: MenuIcons['dashboard'] },
]; 



export const DEFAULT_SIDEBAR_ITEMS = PRODUCTION_DATA_ITEMS;

export const SIDEBAR_CONFIG = {
    EXPANDED_WIDTH: '280px',
    COLLAPSED_WIDTH: '70px',
    HEADER_HEIGHT: '64px',
};

