/**
 * Tenant identification strategy types.
 * Use one of: SUBDOMAIN | PATH | TOKEN | HOST
 * HOST: tenant and API base URL derived from current window host (e.g. pm.indi4.io -> http://neosoft-pm.indi4.io:8000)
 */
export const TENANT_STRATEGY = {
  SUBDOMAIN: 'SUBDOMAIN',
  PATH: 'PATH',
  TOKEN: 'TOKEN',
  HOST: 'HOST',
};

export const DEFAULT_STRATEGY = TENANT_STRATEGY.PATH;
