# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev        # vite dev server on port 5173 (strictPort)
npm run build      # tsc -b (full project-reference typecheck) && vite build
npm run preview    # vite preview on port 4173 (strictPort)
npm run typecheck  # tsc -b only, no bundling — use for a quick type check
```

There is **no test runner configured** (no Vitest/Jest, no test files under `src/`, no `test` script). If asked to add or run tests, you're starting from zero — check with the user before introducing a framework.

Only one env var is consumed: `VITE_API_BASE_URL` (see `.env.example`), the default backend origin. It's overridable per-browser at runtime via a `youome.apiBaseUrl` localStorage key (see below), so changing `.env` alone won't necessarily change what a given browser session is pointed at.

## Big-picture architecture

Vite + React 19 + TypeScript SPA talking to the separate `backend/` Express API. No external state library (no Redux/Zustand/React Query) — all cross-cutting state lives in one React Context.

### Bootstrap (`src/main.tsx` → `src/App.tsx`)

`main.tsx` mounts `<App />` and imports the single global stylesheet `src/styles.css`. `App.tsx` nests: `ThemeProvider` (MUI theme, `src/config/theme.ts`) → `CssBaseline` → `AppProvider` (`src/app/AppStateContext.tsx`) → `BrowserRouter` → `Routes` (classic JSX route config, not the v7 data-router API).

Routes: `/` → redirect to `/dashboard`; `PublicOnlyRoute`-wrapped `/login`, `/register`; a `ProtectedRoute`-wrapped layout route rendering `AppShell` with nested authenticated pages — `/dashboard`, `/groups`, `/groups/:id`, `/groups/:id/settings`, `/friends`, `/expenses`, `/settlements`, `/notifications`, `/settings`, `/admin`; catch-all `*` → `/dashboard`.

**`/admin` has no role/admin check** — `ProtectedRoute` only requires a logged-in `currentUser` (real or dev-bypass), same as every other authenticated page. Don't assume there's an authorization boundary there beyond "is logged in."

### App state (`src/app/AppStateContext.tsx`) — the one thing to understand before changing behavior

`AppProvider`/`useAppState()` is the single source of truth for: `apiBaseUrl`/`backendUrl`, `health`, `session`, `currentUser`, `groups`, a single global `notice` (toast-like `{tone, message}`), `isBootstrapping`, and `admin` (Redis-backed routes/jobs/state bundle). Actions (`login`, `register`, `refreshSession`, `logout`, `deleteCurrentUser`, `reloadGroups`, `reloadAdminState`, etc.) are `useCallback`-wrapped calls into `shared/api/backend.ts` that synchronously replace local state — there's no caching/dedup/invalidation layer; "reload*" just refetches and overwrites.

Bootstrap-on-mount sequence: `GET /health` → `bootstrapCurrentUser()` (if a stored session exists, `GET /api/auth/me` with its bearer token to restore the session; if not, it **still calls `GET /api/auth/me` with no Authorization header**, relying on the backend's dev auth bypass — so in a dev-bypassed backend, the app always ends up "logged in" even with no real session) → `reloadGroups()`. Any failure surfaces a warning `notice` but never blocks the app.

Session/base-URL persistence is effect-driven: separate `useEffect`s write `session`/`backendUrl` to localStorage whenever they change, rather than being written explicitly at each call site.

### Route guards (`src/app/RouteGuards.tsx`)

Both `ProtectedRoute` and `PublicOnlyRoute` read `{ currentUser, isBootstrapping }` from `useAppState()` and render a shared loading state while bootstrapping; after that, `ProtectedRoute` redirects to `/login` (preserving the intended path in nav state), `PublicOnlyRoute` redirects an already-logged-in user to `/dashboard`.

### Folder layout (`src/`)

- `app/` — bootstrap/session orchestration and route guards (`AppStateContext.tsx`, `RouteGuards.tsx`). Not UI.
- `config/` — app-wide config objects, currently just the MUI `theme.ts`.
- `pages/` — one folder per route/feature (`admin/`, `auth/`, `expenses/`, `friends/`, `groups/`, `home/`, `notifications/`, `settings/`, `settlements/`), wired directly into `App.tsx`'s `<Routes>`.
- `shared/` — feature-agnostic building blocks: `shared/api/backend.ts` (the entire HTTP client + typed request functions + domain types) and `shared/lib/format.ts` (currency/timestamp/count formatting). There is no separate `lib/` folder — that responsibility lives inside `shared/lib/`.
- `widgets/` — reusable UI blocks bigger than a component but smaller than a page: `widgets/layout/AppShell.tsx` (persistent shell + bottom nav + `<Outlet />`), `widgets/module/ModulePage.tsx` (generic admin-style page listing backend routes by module), `widgets/module/group/GroupDebtWidget.tsx`.

### API/session layer (`src/shared/api/backend.ts`)

Single file containing all domain types and every backend-calling function, built on one `fetchJson<T>()` helper: sets `Accept: application/json` (+ `Content-Type` when a `json` body is passed), and for auth — **if a `token` option is passed it sets `Authorization: Bearer <token>`, otherwise it sets `X-Dev-User-Id: <devUserId>`** (a persisted synthetic id, `ensureDevUserId()`, generated via `crypto.randomUUID()` on first use). Every unauthenticated request still self-identifies via that header rather than sending no identity — this is what the backend's dev bypass keys off of. Non-OK responses throw a plain `Error` (using `payload.message` when present); there's no custom error class, so callers just read `.message`.

localStorage keys (`STORAGE_KEYS`): `youome.session` (full `AuthSession`), `youome.apiBaseUrl` (backend base URL override, defaults to `VITE_API_BASE_URL` or `http://localhost:3000`), `youome.devUserId` (synthetic dev identity).

Endpoint coverage mirrors the backend's pluralized module routes: auth (`/api/auth/*`), `/health`, groups (`/api/groups`, `/api/groups/:id/debts`), `/api/group-members/...`, `/api/group-invites/...`, `/api/friend-lists/summary`, `/api/friend-invites/...`, `/api/expenses/...` (including the payment submit/reject/confirm/receipt lifecycle), `/api/notifications/...`, and the admin/Redis endpoints `/api/redis/state`, `/api/redis/routes`, `/api/redis/jobs`. When the backend contract changes, update this file in the same change.

### Admin area (`src/pages/admin/AdminPage.tsx`)

A **read-only observability console** over backend runtime state (not a CRUD panel for app data). On mount it fetches `/api/redis/state` + `/api/redis/routes` + `/api/redis/jobs` via `reloadAdminState()` and renders metric cards (route/job counts, uptime, Redis/health status), a job list, a route inventory grouped by backend module (`widgets/module/ModulePage.tsx` reuses this same route data for simpler per-module subpages), and the current notice/user footer. There's no dedicated Mongo health endpoint — the UI infers a "Connected at startup" Mongo status purely from a successful `/health` response.

### Styling

Hybrid, no strict boundary: **global plain CSS** (`src/styles.css`, one large hand-written stylesheet with utility/BEM-ish class names — `.panel`, `.admin-layout`, `.metric-card`, `.notice-{tone}`, `.callout-{tone}`, `.shell-root`, etc.) drives most page/panel/layout chrome (admin, module pages, auth screens, shell/nav), while **MUI + Emotion** (themed via `ThemeProvider`/`config/theme.ts`) is used for richer interactive components (forms, cards with `sx`). `lucide-react` icons are used alongside/instead of MUI icons in several places. No Tailwind, no CSS modules — `postcss.config.js` only adds `autoprefixer`. Don't introduce Tailwind; follow the existing global-CSS-plus-MUI split.

### Build/tooling

No path aliases (Vite or TS) — all imports are relative. `tsconfig.json` is a project-reference root (`strict: true`, `jsx: "react-jsx"`, `noEmit: true`, types include `vite/client` so `import.meta.env.VITE_*` is typed) referencing `tsconfig.node.json` (scoped to `vite.config.ts` itself). `npm run build` runs the full `tsc -b` project-reference check before `vite build`, so a type error anywhere blocks the build.

## Practical notes

- Keep API/session behavior in sync with the backend auth flow and the localStorage keys above (`src/shared/api/backend.ts`) — this is the single seam between frontend and backend.
- If an endpoint's contract changes on the backend, update `shared/api/backend.ts` in the same change.
- `/admin` being reachable by any logged-in user (not just admins) is current behavior, not an oversight to silently "fix" — confirm with the user before adding a role gate.
