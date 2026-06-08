/**
 * Resolves current tenant id based on app strategy (subdomain, path, or token).
 * Token-based: tenantId is set externally (e.g. from JWT after login); this only handles URL-based.
 */
import { getTenantFromSubdomain, getTenantFromPath, getTenantFromHost } from '@core/utils/tenantId';
import { TENANT_STRATEGY } from '@core/constants';
import { APP_CONFIG } from '@config/app';

/**
 * @param {string} strategy - TENANT_STRATEGY.SUBDOMAIN | PATH | TOKEN | HOST
 * @param {string} [tokenTenantId] - For TOKEN strategy, pass tenantId from JWT
 * @param {string} [pathPrefix] - For PATH strategy
 * @returns {string|null} tenant id or null
 */
export function resolveTenantId(strategy = APP_CONFIG.tenantStrategy, tokenTenantId = null, pathPrefix = APP_CONFIG.pathPrefix) {
  if (strategy === TENANT_STRATEGY.TOKEN && tokenTenantId) {
    return tokenTenantId;
  }
  if (strategy === TENANT_STRATEGY.SUBDOMAIN) {
    return getTenantFromSubdomain(typeof window !== 'undefined' ? window.location.hostname : '');
  }
  if (strategy === TENANT_STRATEGY.PATH) {
    return getTenantFromPath(typeof window !== 'undefined' ? window.location.pathname : '', pathPrefix);
  }
  if (strategy === TENANT_STRATEGY.HOST) {
    return getTenantFromHost(typeof window !== 'undefined' ? window.location.hostname : '');
  }
  return null;
}
