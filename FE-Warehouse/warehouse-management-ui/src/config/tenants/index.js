/**
 * Tenant config registry.
 * In production, tenant configs can be loaded from API; this is the static fallback map.
 */
import { defaultTenantConfig } from './default';

const tenantConfigMap = {
  default: defaultTenantConfig,
  tenant1: {
    ...defaultTenantConfig,
    id: 'tenant1',
    name: 'Tenant One',
    apiBaseUrl: import.meta.env.VITE_TENANT1_API_URL || '/api/tenant1',
    theme: {
      primary: '#059669',
      secondary: '#475569',
      accent: '#10b981',
      logoUrl: null,
    },
    roles: ['admin', 'planner', 'viewer'],
    featureFlags: {
      planning: true,
      scheduling: true,
      reports: true,
      advancedFilters: true,
    },
  },
  tenant2: {
    ...defaultTenantConfig,
    id: 'tenant2',
    name: 'Tenant Two',
    apiBaseUrl: import.meta.env.VITE_TENANT2_API_URL || '/api/tenant2',
    theme: { primary: '#7c3aed', secondary: '#4b5563', accent: '#8b5cf6', logoUrl: null },
    roles: ['viewer'],
    featureFlags: {
      planning: true,
      scheduling: true,
      reports: false,
      advancedFilters: false,
    },
  },
};

/**
 * Get tenant config by id; returns default if not found.
 * @param {string} tenantId
 * @returns {Object} tenant config
 */
export function getTenantConfig(tenantId) {
  if (!tenantId) return defaultTenantConfig;
  return tenantConfigMap[tenantId] || { ...defaultTenantConfig, id: tenantId, name: tenantId };
}

export { defaultTenantConfig, tenantConfigMap };
