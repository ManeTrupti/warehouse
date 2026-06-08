import { useContext } from 'react';
import { TenantContext } from '@tenant/context/TenantProvider';

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return ctx;
}
