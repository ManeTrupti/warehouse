/**
 * Legacy tenant interceptor (no-op for X-Tenant-Id).
 * Kept only for compatibility; baseURL and headers are managed in apiService.
 */

let getTenantConfigFn = () => null;

/**
 * Register a function that returns current tenant config { apiBaseUrl, id }.
 * @param {() => { apiBaseUrl: string, id: string } | null} fn
 */
export function setTenantConfigGetter(fn) {
  getTenantConfigFn = fn;
}

/**
 * Create request interceptor that:
 * - Optionally overrides baseURL from tenant config
 * - Does NOT set any X-Tenant-Id header anymore
 */
export function createTenantInterceptor() {
  return (config) => {
    const tenant = getTenantConfigFn();
    if (tenant?.apiBaseUrl) {
      config.baseURL = tenant.apiBaseUrl;
    }
    return config;
  };
}
