import { useTenant } from '@tenant/hooks/useTenant';

/**
 * Renders children only if the current tenant user has one of the allowed roles.
 */
export function RequireRole({ allowedRoles = [], children, fallback = null }) {
  const { hasRole } = useTenant();
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasAccess = allowed.some((role) => hasRole(role));
  return hasAccess ? children : fallback;
}
