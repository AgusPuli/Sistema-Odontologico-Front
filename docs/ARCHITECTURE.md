# Architecture conventions — Sistema Odontológico (frontend)

Companion to the backend `docs/ARCHITECTURE.md`. Read this before adding a
new screen or module.

## Stack

- Next.js 15 (App Router) + React 18
- TypeScript strict
- TanStack Query 5 (server state) + Zustand 5 with persist (auth state only)
- shadcn/ui (Radix) + Tailwind 3
- Axios with a single shared instance, interceptors for `Authorization` and
  `X-Tenant-ID` + queued 401 / refresh-token retry

## Folder layout

```
src/
├── app/(auth)/...           → public routes: /login, /setup
├── app/(dashboard)/...      → protected routes
├── components/
│   ├── ui/                  → shadcn primitives (Button, Card, Dialog, ...)
│   ├── shared/              → reused composites (PageHeader, EmptyState, FormField...)
│   └── layout/              → Sidebar, dashboard layout
├── features/<feature>/
│   ├── api/                 → axios calls — one file per resource
│   ├── hooks/               → useQuery / useMutation wrappers
│   ├── types/               → mirror of backend DTOs
│   ├── schemas/             → zod schemas (only where forms need them)
│   ├── components/          → feature-specific UI
│   ├── utils/               → pure helpers
│   └── config/              → feature-specific static data (catalogs, palettes)
├── lib/                     → api client, constants, utilities
├── stores/                  → Zustand stores
├── hooks/                   → cross-feature hooks (use-debounced-value, ...)
└── types/                   → shared cross-feature types
```

## Data flow

```
component → useXxx() hook → xxxApi.method() → axios → backend
                ↑                                        ↓
            TanStack Query cache  ←  ApiResponse<T>.data
```

- API functions return the parsed `ApiResponse<T>` directly. Hooks `select`
  `r.data` so components consume the inner payload.
- Mutations show toasts on success and on error from a single place
  (the hook). Components never `toast.error(...)` themselves.

## Types

Every feature has `types/<feature>.types.ts` mirroring the backend's response
DTO. Match field names exactly (camelCase on both sides; the backend uses
Jackson defaults).

When a backend enum exists, the frontend mirrors it as a `type ... = '...' | '...'`
union. **Do NOT use `as const` arrays** for that — the union form is what's
ergonomic in props.

## Auth

`useAuth()` returns the persisted user. `AxiosInstance` injects
`Authorization: Bearer <token>` and `X-Tenant-ID: <id>` automatically. On 401,
the response interceptor queues the request, calls `/auth/refresh`, then
retries — there's no special handling required at call sites.

## Forms

React Hook Form + Zod resolver. Schemas live in
`features/<feature>/schemas/<feature>.schemas.ts`. Submit handlers call the
mutation directly and pass `{ onSuccess, onError }` per-call when they need to
navigate or reset.

## Catalogs (selects, palettes, legends)

Anything that's "a finite set of options the user picks from" goes through a
**single config file**. Example: `features/odontogram/config/conditions.ts`
holds the full `ToothCondition` metadata (label, color, symbol, category,
display order). The palette, the dialog, the legend and the chart cell all
read from there — adding a finding is **one edit**.

See `docs/ADDING_FINDINGS.md` for the step-by-step.

## Shared components

Reuse these instead of building one-offs:

| Component | Use |
|---|---|
| `PageHeader` | Title + description + actions for a route |
| `EmptyState` | "No results" rows / blocks |
| `LoadingState` | Skeleton row / block |
| `InfoField` | Read-only label + value |
| `FormField` | Label + control + error wrapper |
| `ConfirmDialog` | Destructive action confirmation |
| `StatCard` | Dashboard KPI tile |
| `DataTablePagination` | Server-side pagination footer |

## Extending — checklists

### Add a new screen

1. Create `app/(dashboard)/<route>/page.tsx`.
2. Use `PageHeader`, `Card`, `Table` from shared / shadcn.
3. Data fetching: feature hook + TanStack Query. Mutations: `useMutation`
   wrapped in the feature's `use-*.ts`.
4. If the route shows a select/menu derived from a backend enum, **don't
   inline the options** — add or extend the relevant `features/<feature>/config/*.ts`.
5. Add to the sidebar in `components/layout/sidebar.tsx`.

### Add a new feature module

```
features/<name>/
├── api/<name>.api.ts        → one object with methods, exports
├── hooks/use-<name>.ts      → useXxxList / useXxx / useCreateXxx / ...
├── types/<name>.types.ts    → mirror backend DTOs
├── schemas/<name>.schemas.ts (if there are forms)
├── components/...           → feature-only UI
└── config/...               → catalogs / palettes / static data
```

### Add a new finding / catalog entry

See `docs/ADDING_FINDINGS.md`.
