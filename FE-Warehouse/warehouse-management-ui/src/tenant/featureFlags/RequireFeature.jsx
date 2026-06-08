import { useTenant } from '@tenant/hooks/useTenant';

/**
 * Renders children only if the given feature flag is enabled for the current tenant.
 */
export function RequireFeature({ flag, children, fallback = null }) {
  const { hasFeature } = useTenant();
  return hasFeature(flag) ? children : fallback;
}
