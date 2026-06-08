import axios from 'axios';
import config from '../../config';

/**
 * API config + axios instance + apiService (all in one).
 * Uses config.apiUrl (from root config.js) for both dev and prod.
 */

function getApiBaseUrl() {
  const base = config.apiUrl || '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

function buildWebSocketUrl(wsPath) {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const httpUrl = getApiBaseUrl();
    const base = window.location.origin;
    const apiUrl = new URL(httpUrl, base);

    // Always use browser hostname so tenant + domain are dynamic
    const browserHostname = window.location.hostname || apiUrl.hostname || '';

    // Prefer the port from API base; fall back to 8000 if none is set
    const port = apiUrl.port || '8000';

    const wsProtocol =
      window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    const hostWithPort = port ? `${browserHostname}:${port}` : browserHostname;
    const path = wsPath.startsWith('/') ? wsPath : `/${wsPath}`;

    return `${wsProtocol}//${hostWithPort}${path}`;
  } catch (e) {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.error('Failed to build WebSocket URL from API base', e);
    }
    return '';
  }
}

if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && typeof window !== 'undefined') {
  console.log('API Base URL:', getApiBaseUrl());
}

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  },
  withCredentials: false,
});

axiosInstance.interceptors.request.use((config) => {
  // Ensure headers are properly set for CORS
  config.headers = config.headers || {};
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  if (!config.headers['Accept']) {
    config.headers['Accept'] = 'application/json, text/plain, */*';
  }
  
  // Log request for debugging (only in development)
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: config.url?.startsWith('http') ? config.url : `${config.baseURL}${config.url}`,
      headers: config.headers,
    });
  }
  
  return config;
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log CORS errors specifically
    if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS') || error.message?.includes('Network Error')) {
      console.error('CORS Error:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
        },
      });
    }
    return Promise.reject(error);
  }
);

/**
 * Sanitizes URL for axios requests
 * - If URL is a full URL (starts with http:// or https://), return as-is
 * - If URL starts with '/', remove the leading slash (axios will add it to baseURL)
 * - Otherwise, return as-is
 */
const sanitizeUrl = (url) => {
  // If it's a full URL (absolute), return as-is - axios will ignore baseURL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // For relative URLs, remove leading slash if present
  return url.startsWith('/') ? url.slice(1) : url;
};

export const apiService = {
  get(url, config = {}) {
    return axiosInstance.get(sanitizeUrl(url), config);
  },
  post(url, data, config = {}) {
    return axiosInstance.post(sanitizeUrl(url), data, config);
  },
  put(url, data, config = {}) {
    return axiosInstance.put(sanitizeUrl(url), data, config);
  },
  patch(url, data, config = {}) {
    return axiosInstance.patch(sanitizeUrl(url), data, config);
  },
  delete(url, config = {}) {
    return axiosInstance.delete(sanitizeUrl(url), config);
  },
};

export default apiService;
export { axiosInstance, getApiBaseUrl, buildWebSocketUrl };
