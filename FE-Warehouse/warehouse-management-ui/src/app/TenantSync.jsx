import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTenant } from '@core/store/slices/tenantSlice';
import { useTenant } from '@tenant/hooks/useTenant';
import { store } from '@core/store';
import { setupTenantAxios } from '@tenant/api';

/**
 * Keeps Redux tenant slice in sync with TenantContext.
 * Enables Axios interceptor to read tenant config from store.
 * Registers the tenant config getter for axios so all API requests use the current tenant's base URL.
 */
export function TenantSync() {
  const dispatch = useDispatch();
  const { tenantId, config } = useTenant();

  useEffect(() => {
    setupTenantAxios(() => store.getState().tenant.config);
  }, []);

  useEffect(() => {
    if (tenantId && config) {
      dispatch(setTenant({ tenantId, config }));
    }
  }, [dispatch, tenantId, config]);

  return null;
}
