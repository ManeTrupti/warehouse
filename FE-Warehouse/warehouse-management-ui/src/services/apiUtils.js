import { APP_CONFIG } from "@config/app";

/**
 * Builds API URL with host prefix for multi-tenant backend pattern
 *
 * This utility function constructs API URLs following the pattern:
 * - GET/PUT/DELETE: http://neosoft-{{host}}:{{port}}/path
 * - POST: http://wayne-{{host}}:{{port}}/path
 *
 * @param {string} prefix - Host prefix ('neosoft', 'wayne', etc.)
 * @param {string} path - API path (e.g., '/config/shifts/' or 'config/shifts/')
 * @param {object} options - Optional configuration
 * @param {string} options.protocol - Override protocol (default: from APP_CONFIG or window.location)
 * @param {string} options.port - Override port (default: from APP_CONFIG or '8000')
 * @returns {string} Full API URL
 *
 * @example
 * // Basic usage
 * buildApiUrl('neosoft', '/config/shifts/')
 * // Returns: 'http://neosoft-pm.indi4.io:8000/config/shifts/'
 *
 * @example
 * // With custom port
 * buildApiUrl('wayne', '/config/shifts/', { port: '9000' })
 * // Returns: 'http://wayne-pm.indi4.io:9000/config/shifts/'
 */
export function buildApiUrl(path, options = {}, type = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // SSR or test environment
  if (typeof window === "undefined") {
    const base =
      (typeof import.meta !== "undefined" &&
        import.meta.env?.VITE_API_BASE_URL) ||
      "";
    return base ? `${base}${normalizedPath}` : normalizedPath;
  }

  const protocol =
    options.protocol ||
    import.meta.env.VITE_API_PROTOCOL ||
    window.location.protocol.replace(":", "");

  let hostname = window.location.hostname;

  // Environment configs
  const port = type==="inventory" ? options.port || import.meta.env.VITE_API_INVENTORY_PORT || "" : options.port || import.meta.env.VITE_API_PORT || "";

  const apiPrefix =
    hostname === "localhost" || hostname === "127.0.0.1" ? "/api" : "/api";
  // import.meta.env.VITE_API_PREFIX || "";

  // Handle localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    if (type === "inventory") {
      hostname =
        import.meta.env?.VITE_API_HOSTNAME_INVENTORY || "inventory.indi4.io";
    } else {
      hostname = import.meta.env?.VITE_API_HOSTNAME || "warehouse.indi4.io";
    }
  }

  // Extract tenant
  const tenant = hostname.split("-")[0];
  let baseDomain = "";
  // Remove tenant prefix
  if (type === "inventory") {
    baseDomain = hostname.includes("-")
      ? "inventory.indi4.io"
      : hostname;
  } else {
    baseDomain = hostname.includes("-")
      ? hostname.substring(hostname.indexOf("-") + 1)
      : hostname;
  }

  const apiHost = `${tenant}-${baseDomain}`;

  // Add port only if defined
  const portPart = port ? `:${port}` : "";

  return `${protocol}://${apiHost}${portPart}${apiPrefix}${normalizedPath}`;
}

/**
 * Builds API URL for GET, PUT, DELETE operations (uses 'neosoft' prefix)
 *
 * @param {string} path - API path
 * @param {object} options - Optional configuration
 * @returns {string} Full API URL
 */
export function buildGetApiUrl(path, options = {}) {
  return buildApiUrl(path, options);
}

/**
 * Build GET API URL that targets localhost in development.
 *
 * Use this when backend GET endpoints are hosted on plain localhost during dev
 * (e.g. `http://localhost:8000/...`), but should use the tenant/live URL in prod.
 *
 * This helper is intentionally additive so existing URL builders are unchanged.
 *
 * @param {string} path - API path
 * @param {object} options
 * @param {string} options.devBaseUrl - Override dev base (default: http://localhost:8000)
 * @returns {string}
 */
export function buildLocalGetApiUrl(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const devBaseUrl =
    options.devBaseUrl ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_DEV_GET_API_BASE_URL) ||
    "http://localhost:8000";

  const isDev =
    (typeof import.meta !== "undefined" && import.meta.env?.DEV) ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"));

  if (isDev) {
    const base = devBaseUrl.endsWith("/") ? devBaseUrl.slice(0, -1) : devBaseUrl;
    return `${base}${normalizedPath}`;
  }

  return buildGetApiUrl(normalizedPath, options);
}

/**
 * Builds API URL for POST operations (uses 'wayne' prefix)
 *
 * @param {string} path - API path
 * @param {object} options - Optional configuration
 * @returns {string} Full API URL
 */
export function buildPostApiUrl(path, options = {}) {
  return buildApiUrl(path, options);
}

export function buildInventoryGetApiUrl(path, options = {}) {
  return buildApiUrl(path, options, "inventory");
}

/**
 * Builds API URL for PUT operations (uses 'neosoft' prefix)
 *
 * @param {string} path - API path
 * @param {object} options - Optional configuration
 * @returns {string} Full API URL
 */
export function buildPutApiUrl(path, options = {}) {
  return buildApiUrl(path, options);
}

/**
 * Builds API URL for DELETE operations (uses 'neosoft' prefix)
 *
 * @param {string} path - API path
 * @param {object} options - Optional configuration
 * @returns {string} Full API URL
 */
export function buildDeleteApiUrl(path, options = {}) {
  return buildApiUrl(path, options);
}
