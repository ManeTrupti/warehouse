/**
 * Application-wide config (non-tenant-specific).
 * For HOST strategy: API base URL is built as neosoft-{{hostname}}:{{apiPort}} (e.g. http://neosoft-pm.indi4.io:8000).
 */
export const APP_CONFIG = {
  tenantStrategy: 'HOST', // SUBDOMAIN | PATH | TOKEN | HOST
  pathPrefix: '/tenant',
  defaultTenantId: null,
  apiTimeout: 30000,
  /** API port for HOST strategy (neosoft-{hostname}:port). Override with VITE_API_PORT. */
  apiPort: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_PORT) || '8000',
  /** Protocol for API base URL when using HOST strategy. Override with VITE_API_PROTOCOL. */
  apiProtocol: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_PROTOCOL) || 'http',
};
