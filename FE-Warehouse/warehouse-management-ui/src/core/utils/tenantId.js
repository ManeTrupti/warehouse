/**
 * Extracts tenant identifier from the current environment (host/path).
 * Used when strategy is SUBDOMAIN or PATH; for TOKEN, tenant comes from JWT.
 */

/**
 * Get tenant from subdomain (e.g. tenant1.myapp.com -> tenant1)
 * @param {string} [hostname] - window.location.hostname
 * @returns {string|null}
 */
export function getTenantFromSubdomain(
  hostname = typeof window !== "undefined" ? window.location.hostname : "",
) {
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const subdomain = parts[0];
    if (subdomain && subdomain !== "www" && subdomain !== "app") {
      return subdomain;
    }
  }
  return null;
}

/**
 * Get tenant from path (e.g. /tenant/tenant1/dashboard -> tenant1)
 * @param {string} [pathname] - window.location.pathname
 * @param {string} pathPrefix - e.g. '/tenant'
 * @returns {string|null}
 */
export function getTenantFromPath(
  pathname = typeof window !== "undefined" ? window.location.pathname : "",
  pathPrefix = "/tenant",
) {
  const prefix = pathPrefix.endsWith("/") ? pathPrefix : pathPrefix + "/";
  if (pathname.startsWith(prefix)) {
    const rest = pathname.slice(prefix.length);
    const segment = rest.split("/")[0];
    return segment || null;
  }
  return null;
}

/**
 * Build path with tenant segment for PATH strategy
 * @param {string} tenantId
 * @param {string} path - e.g. '/dashboard'
 * @param {string} pathPrefix
 * @returns {string}
 */
export function buildTenantPath(tenantId, path, pathPrefix = "/tenant") {
  const base = pathPrefix.endsWith("/") ? pathPrefix.slice(0, -1) : pathPrefix;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}/${tenantId}${p}`;
}

/**
 * Get tenant from current host (e.g. pm.indi4.io -> pm.indi4.io).
 * Used when strategy is HOST; tenant id is the hostname.
 * @param {string} [hostname] - window.location.hostname
 * @returns {string|null}
 */
export function getTenantFromHost(
  hostname = typeof window !== "undefined" ? window.location.hostname : "",
) {
  if (!hostname || hostname === "localhost") return null;
  return hostname;
}

/**
 * Build API base URL for backend multi-tenant pattern: http://neosoft-{{host}}:{{port}}
 * Example: pm.indi4.io + port 8000 -> http://neosoft-pm.indi4.io:8000
 * @param {string} hostname - e.g. pm.indi4.io
 * @param {{ protocol?: string, port?: string }} [options] - protocol (default 'http'), port (default from env or 8000)
 * @returns {string}
 */
export function getApiBaseUrlFromHost(hostname, options = {}) {
  const protocol = options.protocol ?? "http";
  const port = options.port ?? "8000";
  const apiHost = `neosoft-${hostname}`;
  console.log(protocol, hostname, port);
  return `${protocol}://${apiHost}:${port}`;
  console.log(protocol, hostname, port);
}
