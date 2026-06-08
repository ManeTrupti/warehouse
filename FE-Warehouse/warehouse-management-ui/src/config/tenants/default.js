/**
 * Default tenant config used when no tenant is resolved or as fallback.
 */
export const defaultTenantConfig = {
  id: 'default',
  name: 'Default Tenant',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  theme: {
    primary: '#2563eb', // Blue - matching IPSS brand, Demand Fulfillment, Engine Orders
    secondary: '#f97316', // Orange - matching Axle Orders, donut charts
    accent: '#0ea5e9', // Light blue - matching In Progress cards
    logoUrl: null,
  },
  roles: ['viewer'],
  featureFlags: {
    planning: true,
    scheduling: true,
    reports: true,
    advancedFilters: false,
  },
};
