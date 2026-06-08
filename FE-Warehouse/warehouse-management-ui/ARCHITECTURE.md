# PPS Frontend Architecture — Multi-Tenant

Production Planning & Scheduling (PPS) UI is a **multi-tenant** React SPA with clear separation of core, tenant, feature, and shared layers.

---

## 1. Tenant Identification Strategy

Three strategies are supported; choose one via `src/config/app.js` → `tenantStrategy`:

| Strategy   | Example                          | Use case                    |
|-----------|-----------------------------------|-----------------------------|
| **SUBDOMAIN** | `tenant1.myapp.com`             | SaaS with custom subdomains |
| **PATH**      | `/tenant/tenant1/dashboard`     | Single domain, path-scoped  |
| **TOKEN**     | `tenantId` from JWT after login  | SPA with API-driven tenant  |

- **Subdomain**: Tenant id = first hostname segment (e.g. `tenant1` from `tenant1.myapp.com`). No path prefix.
- **Path**: Tenant id = first segment after `/tenant/` (e.g. `tenant1` from `/tenant/tenant1/dashboard`). Use `tenantPath('/dashboard')` for links.
- **Token**: Tenant id is not derived from URL; set via `TenantProvider` prop `tokenTenantId` (e.g. from decoded JWT after auth).

---

## 2. Project Structure

```
src/
├── core/                    # Shared logic (tenant-agnostic)
│   ├── constants/           # TENANT_STRATEGY, etc.
│   ├── utils/               # getTenantFromSubdomain, getTenantFromPath, buildTenantPath
│   └── store/               # Redux store
│       └── slices/
│           └── tenantSlice.js
├── tenant/                  # Tenant layer
│   ├── context/             # TenantProvider
│   ├── strategies/          # resolveTenantId (subdomain/path/token)
│   ├── hooks/               # useTenant
│   ├── api/                 # axiosInstance + tenant interceptor (X-Tenant-Id, baseURL)
│   ├── theme/               # TenantTheme (CSS variables)
│   ├── rbac/                # RequireRole
│   └── featureFlags/        # RequireFeature
├── features/                # Feature modules
│   ├── planning/            # pages/, routes.js
│   ├── scheduling/
│   └── reports/
├── shared/                  # Shared UI
│   └── components/
│       └── Layout/          # AppLayout
├── config/                  # Config-driven
│   ├── app.js               # tenantStrategy, pathPrefix, defaultTenantId
│   ├── tenants/             # getTenantConfig(id), tenant config map
│   └── routes/              # Route tree (tenant-scoped)
└── app/                     # App bootstrap, TenantSync
```

**Tech stack**: React (Vite), Redux Toolkit, React Router, Axios, JavaScript, Tailwind, ESLint.

---

## 3. Architecture Layers

- **Core**: Constants, utils, Redux store/slices. No tenant-specific logic; only generic tenant-id resolution helpers.
- **Tenant**: Context, resolution strategy, API base URL per tenant, theme, RBAC, feature flags. Single place for “current tenant” and its config.
- **Feature modules**: Planning, scheduling, reports. Each has `pages/` and `routes.js`; use `useTenant()`, `RequireFeature`, `RequireRole` as needed.
- **Shared UI**: Layout and reusable components. Use CSS variables (e.g. `var(--tenant-primary)`) for tenant theming.
- **Config**: `app.js` (strategy, path prefix), `tenants/` (per-tenant config), `routes/` (route tree). New tenant = new config entry (or load from API).

---

## 4. Implemented Pieces

- **Tenant Context Provider**: `src/tenant/context/TenantProvider.jsx` — resolves tenant, exposes `tenantId`, `config`, `tenantPath`, `hasRole`, `hasFeature`, `loading`, `error`.
- **Dynamic API base URL**: Axios request interceptor in `src/tenant/api/tenantInterceptor.js` sets `config.baseURL` and `X-Tenant-Id` from current tenant config (from Redux, synced via TenantSync).
- **Role-based access**: `RequireRole` in `src/tenant/rbac/RequireRole.jsx`; roles come from `config.roles` per tenant.
- **Dynamic theme**: `TenantTheme` in `src/tenant/theme/TenantTheme.jsx` applies `--tenant-primary`, `--tenant-secondary`, `--tenant-accent` from `config.theme`.
- **Feature flags**: `RequireFeature` in `src/tenant/featureFlags/RequireFeature.jsx`; flags from `config.featureFlags` per tenant.

---

## 5. Example Code References

- **TenantProvider**: `src/tenant/context/TenantProvider.jsx`
- **Axios interceptor**: `src/tenant/api/tenantInterceptor.js`, `src/tenant/api/index.js` (`setupTenantAxios(getTenantConfig)`)
- **Routing**: `src/config/routes/index.jsx` (path-based: `/tenant/:tenantId/dashboard|planning|scheduling|reports`)
- **Redux tenant slice**: `src/core/store/slices/tenantSlice.js` (setTenant, selectTenantId, selectTenantConfig, selectHasRole, selectHasFeature)

---

## 6. Scalability & Onboarding

- **100+ tenants**: Tenant config can be loaded from API (e.g. `GET /api/tenants/:id/config`) instead of a static map; keep a small in-memory cache keyed by `tenantId`. Resolve tenant id from URL/token first, then fetch config once per session.
- **Clean separation**: Core has no tenant config; tenant layer owns resolution and config; features only consume `useTenant()` and shared components.
- **New tenant**: Add config to `config/tenants/` (or API); ensure tenant id matches resolution (subdomain segment, path segment, or JWT claim). No feature code changes.
- **Production**: Use env vars for API base URLs per environment; consider lazy-loading tenant config and feature modules by route.
