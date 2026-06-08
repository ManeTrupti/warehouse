import { useEffect } from 'react';
import { useTenant } from '@tenant/hooks/useTenant';

/**
 * Applies tenant theme (CSS variables) to document root.
 * Place once inside TenantProvider (e.g. in App layout).
 */
export function TenantTheme() {
  const { config } = useTenant();
  const theme = config?.theme ?? {};

  useEffect(() => {
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty('--tenant-primary', theme.primary);
    if (theme.secondary) root.style.setProperty('--tenant-secondary', theme.secondary);
    if (theme.accent) root.style.setProperty('--tenant-accent', theme.accent);
    return () => {
      root.style.removeProperty('--tenant-primary');
      root.style.removeProperty('--tenant-secondary');
      root.style.removeProperty('--tenant-accent');
    };
  }, [theme.primary, theme.secondary, theme.accent]);

  return null;
}
