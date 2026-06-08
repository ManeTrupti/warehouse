import axiosInstance from './axiosInstance';
import { createTenantInterceptor, setTenantConfigGetter } from './tenantInterceptor';

let attached = false;

/**
 * Attach tenant interceptor to the shared axios instance.
 * Call once at app init with a getter that returns { apiBaseUrl, id } (e.g. from Redux or Context).
 * @param {() => { apiBaseUrl: string, id: string } | null} getTenantConfig
 */
export function setupTenantAxios(getTenantConfig) {
  setTenantConfigGetter(getTenantConfig);
  if (!attached) {
    axiosInstance.interceptors.request.use(createTenantInterceptor());
    attached = true;
  }
}

export { axiosInstance };
export { createTenantInterceptor, setTenantConfigGetter } from './tenantInterceptor';
