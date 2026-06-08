import { APP_CONFIG } from '@config/app';

const pathPrefix = APP_CONFIG.pathPrefix || '/tenant';
const pathPrefixSegment = pathPrefix.replace(/^\//, '');

/**
 * Route path constants. Use these for Links, Navigate, and redirects.
 * For tenant-scoped paths, use tenantPath() from useTenant() with these segments.
 */
export const ROUTE_PATHS = {
  root: '/',
  tenant: pathPrefix,
  tenantSegment: pathPrefixSegment,
  dashboard: 'dashboard',
  planning: 'planning',
  scheduling: 'scheduling',
  reports: 'reports',
};

/**
 * Builds a tenant-scoped path (e.g. /tenant/tenant1/dashboard).
 * Use when you have tenantId and want the full path.
 * @param {string} tenantId
 * @param {string} segment - path segment after tenant id (e.g. 'dashboard', 'planning')
 * @returns {string}
 */
export function buildTenantPath(tenantId, segment = '') {
  const base = `${pathPrefix}/${tenantId}`;
  return segment ? `${base}/${segment}` : base;
}

export default ROUTE_PATHS;
