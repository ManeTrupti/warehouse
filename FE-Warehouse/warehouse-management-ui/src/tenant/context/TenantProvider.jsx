import { createContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveTenantId } from '@tenant/strategies/resolveTenantId';
import { getTenantConfig } from '@config/tenants';
import { APP_CONFIG } from '@config/app';
import { TENANT_STRATEGY } from '@core/constants';
import { buildTenantPath, getTenantFromHost, getApiBaseUrlFromHost } from '@core/utils/tenantId';

export const TenantContext = createContext(null);

/**
 * TenantProvider: resolves tenant from URL or token, loads config, and exposes
 * tenant id, config, theme, feature flags, and RBAC helpers.
 */
export function TenantProvider({ children, tokenTenantId = null }) {
  const location = useLocation();
  const [tenantId, setTenantIdState] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const strategy = APP_CONFIG.tenantStrategy ?? 'PATH';
  const pathPrefix = APP_CONFIG.pathPrefix ?? '/tenant';

  const resolveAndSetTenant = useCallback(() => {
    const resolved = resolveTenantId(strategy, tokenTenantId, pathPrefix);
    const effectiveId = resolved || APP_CONFIG.defaultTenantId || 'default';
    setTenantIdState(effectiveId);
    let tenantConfig = getTenantConfig(effectiveId);
    if (strategy === TENANT_STRATEGY.HOST) {
      const hostname = getTenantFromHost() || (typeof window !== 'undefined' ? window.location.hostname : null) || 'localhost';
      const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL;
      const apiBaseUrl = (hostname === 'localhost' && envBaseUrl)
        ? envBaseUrl
        : getApiBaseUrlFromHost(hostname, {
            protocol: APP_CONFIG.apiProtocol,
            port: APP_CONFIG.apiPort,
          });
      tenantConfig = { ...tenantConfig, apiBaseUrl, id: effectiveId, name: tenantConfig.name || effectiveId };
    }
    setConfig(tenantConfig);
    setError(null);
    setLoading(false);
  }, [tokenTenantId, strategy, pathPrefix]);

  useEffect(() => {
    resolveAndSetTenant();
  }, [resolveAndSetTenant, location.pathname]);

  const setTenantId = useCallback((id) => {
    setTenantIdState(id);
    setConfig(getTenantConfig(id));
  }, []);

  const tenantPath = useCallback(
    (path) => buildTenantPath(tenantId || 'default', path, pathPrefix),
    [tenantId, pathPrefix]
  );

  const hasRole = useCallback(
    (role) => (config?.roles ?? []).includes(role),
    [config]
  );

  const hasFeature = useCallback(
    (flag) => Boolean(config?.featureFlags?.[flag]),
    [config]
  );

  const value = useMemo(
    () => ({
      tenantId,
      config,
      loading,
      error,
      setTenantId,
      tenantPath,
      hasRole,
      hasFeature,
      strategy,
      pathPrefix,
      isSubdomain: strategy === TENANT_STRATEGY.SUBDOMAIN,
      isPathBased: strategy === TENANT_STRATEGY.PATH,
      isTokenBased: strategy === TENANT_STRATEGY.TOKEN,
      isHostBased: strategy === TENANT_STRATEGY.HOST,
    }),
    [
      tenantId,
      config,
      loading,
      error,
      setTenantId,
      tenantPath,
      hasRole,
      hasFeature,
      strategy,
      pathPrefix,
    ]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
