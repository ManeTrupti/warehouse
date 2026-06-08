export const HEADER_CONFIG = {
    HEIGHT: '64px',
    Z_INDEX: 100,
    NOTIFICATION_COUNT: 3,
    USER_NAME: 'Admin User',
};

export const SEARCH_PLACEHOLDER = 'Search orders, products, resources...';

export const NOTIFICATION_TYPES = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

export const NOTIFICATION_LIST = [
    {
        id: '1',
        type: NOTIFICATION_TYPES.ERROR,
        title: 'Material Shortage Alert',
        description: 'Differential Gears shortage affecting 2 orders',
    },
    {
        id: '2',
        type: NOTIFICATION_TYPES.WARNING,
        title: 'Bottleneck Detected',
        description: 'Axle Assembly Line 2 at 95% utilization',
    },
    {
        id: '3',
        type: NOTIFICATION_TYPES.INFO,
        title: 'Schedule Updated',
        description: 'MRP run completed successfully',
    },
];

