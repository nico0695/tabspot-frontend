# Architecture

Architecture decisions, patterns, and data flow for the TabSpot Frontend.

---

## 1. Architecture Style

The project follows a partial **Feature-Sliced Design (FSD)** approach, chosen over
full domain-driven design for its simplicity at the current scale. All application
code lives under `src/` with the following top-level directories:

```
src/
  app/            Next.js App Router (routes, layouts, pages)
  features/       Domain logic grouped by feature
    auth/         Authentication schemas and types
    catalog/      Public-facing song/artist queries
    admin/        Admin CRUD feature modules
      songs/
      artists/
      genres/
      users/
  components/     Shared UI components
    ui/           Generic primitives (Button, Modal, Select, ...)
    catalog/      Domain components (SongCard, ArtistCardGrid, FilterBar)
    crud/         CRUD components (DataTable, FormBuilder)
    providers/    React context providers (QueryProvider, ThemeProvider)
  lib/            Infrastructure layer
    api/          API client, server fetcher, error types, enums
    supabase/     Supabase client factories (client + server)
  store/          Zustand global stores (useAuthStore, useUIStore)
  styles/         Design tokens and global CSS
  hooks/          Custom React hooks (useDebounce, ...)
  proxy.ts        Next.js middleware for route protection
```

Path alias: `@/*` maps to `./src/*` (configured in `tsconfig.json`).

---

## 2. Data Flow

```
  Pages / Routes
       |
       v
  Feature Hooks  ----------->  React Query (cache layer)
       |                              |
       v                              v
  API Client (client.ts)        Server Fetcher (server.ts)
       |                              |
       |--- Bearer JWT (Supabase) --->|
       v                              v
  Backend REST API (/api/v1/*)
```

**Client-side path:** Pages import feature hooks (e.g. `useSongs`), which call
API functions via `apiClient`. The client auto-injects the Supabase JWT from the
current session. React Query manages caching, refetching, and optimistic updates.

**Server-side path:** RSC pages call cached fetcher functions (e.g. `fetchSongBySlug`)
from `lib/api/server.ts`. These use React `cache()` for request deduplication.
The server fetcher returns `null` on 404 so pages can call `notFound()`.

---

## 3. Server vs Client Components

- **Server Components (RSC):** Used for pages that need SEO metadata or static
  data. Public catalog pages fetch data server-side and pass it to client
  components for interactivity.
- **Client Components:** Marked with `'use client'`. Used for anything requiring
  hooks, state, event handlers, or browser APIs.
- **Pattern:** Pages are often RSC shells that delegate to a `*PageClient.tsx`
  companion for interactive content (e.g. `songs/page.tsx` + `SongsPageClient.tsx`).

---

## 4. Feature Module Pattern

Each feature under `features/` follows a flat file convention. No barrel
exports -- imports reference individual files directly.

| File                     | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `{feature}.types.ts`     | TypeScript interfaces and types            |
| `{feature}.api.ts`       | API call functions using apiClient         |
| `{feature}.hooks.ts`     | React Query hooks                          |
| `{feature}.schema.ts`    | Zod validation schemas                     |
| `{feature}.columns.tsx`  | DataTable column definitions               |
| `{feature}.utils.ts`     | Helper/transform functions                 |
| `{feature}.constants.ts` | Static constants (colocated in app/ route) |

Admin features live under `features/admin/{domain}/`. Public catalog features
live under `features/catalog/`.

---

## 5. Component Composition

Three tiers of components:

1. **UI Primitives** (`components/ui/`) -- Generic, reusable. Each component
   lives in its own folder with a CSS Module and an `index.ts` re-export.
   Examples: Button, Modal, Select, Spinner, Toast, DataTable.

2. **Domain Components** (`components/catalog/`, `components/crud/`) --
   Composed from UI primitives with domain-specific props. Examples:
   SongCard, ArtistCardGrid, FilterBar, FormBuilder.

3. **Page Components** (`app/{route}/components/`) -- Colocated with their
   route. Handle page-specific layout and form modals. Examples:
   SongFormModal, ArtistFormModal, UserActionModal.

---

## 6. State Management Strategy

Three distinct state categories, each handled by a dedicated tool:

| Category     | Tool            | Persistence            | Example                    |
| ------------ | --------------- | ---------------------- | -------------------------- |
| Server state | React Query     | In-memory cache        | Song lists, artist details |
| Client state | Zustand         | Memory or localStorage | Auth session, sidebar open |
| Form state   | React Hook Form | Component-local        | Login form, song editor    |

**React Query** handles all server-synchronized state. Infinite queries with
cursor-based pagination for public catalog; standard queries with offset
pagination for admin tables.

**Zustand** stores:

- `useAuthStore` -- Persisted to `localStorage` with `skipHydration: true`
  and selective `partialize` (only `user`, `token`, `isAuthenticated`).
- `useUIStore` -- Ephemeral. Tracks sidebar state.

**React Hook Form + Zod:** Every form has a paired Zod schema. Validation
runs client-side before submission. Schemas are defined in
`{feature}.schema.ts`.

---

## 7. Auth Architecture

```
  Browser
    |
    v
  Supabase Auth SDK (client)  <---->  Supabase (identity provider)
    |
    |-- JWT access_token
    v
  useAuthStore (Zustand, persisted)
    |
    v
  apiClient (auto-injects Bearer header)
    |
    v
  Backend REST API (validates JWT)
```

**Login flow:**

1. `useAuthStore.loginSupabase()` calls `supabase.auth.signInWithPassword()`
2. On success, fetches `/api/v1/me` with the new token
3. Stores `user`, `token`, `isAuthenticated` in Zustand (persisted to localStorage)

**Route protection (two layers):**

- **Server-side:** `proxy.ts` middleware intercepts requests. Protected patterns
  (`/admin`, `/profile`, `/tabs/create`, `/tabs/edit`) redirect unauthenticated
  users to `/login?redirectTo=...`. Auth pages redirect authenticated users to `/`.
- **Client-side:** Admin layout checks user role from the auth store.

**Session validation:** `validateSession()` compares the Supabase session token
against the stored token and refreshes user data if they differ.

---

## 8. API Layer

### Client-side (`lib/api/client.ts`)

Centralized `apiClient` object with typed methods: `get`, `post`, `put`, `patch`, `delete`.

- Auto-injects Supabase JWT via `getToken()` on every request
- Throws `ApiError` with structured fields: `status`, `code`, `message`, `fields`
- Returns `undefined` for 204 No Content responses

### Server-side (`lib/api/server.ts`)

Guarded with `import 'server-only'`. Provides cached fetch functions wrapped
with React `cache()` for RSC deduplication.

- Returns `null` on 404 (pages decide whether to call `notFound()`)
- No auth token injection (public endpoints only)

### Pagination strategies

- **Cursor-based** (public catalog): `useInfiniteQuery` with `nextCursor` / `hasMore`.
  Used for song and artist listings.
- **Offset-based** (admin tables): Standard `useQuery` with `page` + `limit` params.
  Used for DataTable pages.

### Environment validation

`lib/env.ts` uses `@t3-oss/env-nextjs` + Zod. Build fails on missing vars:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_BASE_URL`.

---

## 9. Route Architecture

```
src/app/
  layout.tsx              Root layout (providers, fonts, theme)
  page.tsx                Home page
  (auth)/                 Route group -- centered layout, no nav
    layout.tsx
    login/page.tsx
    register/page.tsx
  (public)/               Route group -- navbar layout
    layout.tsx
    Navbar/
    songs/page.tsx        Song catalog (cursor pagination)
    artists/page.tsx      Artist catalog (cursor pagination)
  admin/                  Prefix segment -- sidebar layout, protected
    layout.tsx
    page.tsx              Admin root
    songs/page.tsx        Song CRUD
    artists/page.tsx      Artist CRUD
    genres/page.tsx       Genre CRUD
    users/page.tsx        User management
    demo/page.tsx         Component demo page
```

Route groups `(auth)` and `(public)` do not affect URL paths. The `admin/`
prefix creates a `/admin` URL segment with its own layout.

---

## 10. Styling Architecture

- **CSS Modules** (`*.module.css`) for all component styles. Tailwind was
  explicitly rejected; monospace score rendering requires precise character
  alignment that utility classes cannot reliably provide.
- **Design tokens** defined as CSS custom properties in `styles/tokens/`.
  Consumed by CSS Modules via `var(--token-name)`.
- **Theme switching** via `next-themes`. The `data-theme` attribute on
  `<html>` drives token values. Dark theme is the default.
- **Radix UI** provides accessible behavior primitives (Dialog, Tooltip,
  DropdownMenu, Checkbox, Toggle). All visual styling is custom via CSS Modules.

---

## 11. Key Decisions

| Decision                                       | Rationale                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| CSS Modules over Tailwind                      | Score rendering needs monospace alignment; CSS Modules give full control        |
| Radix UI for a11y primitives                   | Accessible behavior without opinionated styles                                  |
| Supabase for auth                              | Matches the backend identity provider                                           |
| Feature-sliced over domain-driven              | Simpler for the current codebase scale                                          |
| No barrel exports in features/                 | Avoids circular dependency issues                                               |
| `@t3-oss/env-nextjs` for env                   | Build-time validation prevents runtime failures from missing vars               |
| Cursor pagination for public, offset for admin | Cursor handles infinite scroll; offset suits table pagination with page numbers |
| `skipHydration` on auth store                  | Prevents SSR/client mismatch for persisted Zustand state                        |

---

## Related Docs

- `docs/module-conventions.md` -- File naming and module structure rules
- `docs/frontend-init-proyect.md` -- Setup roadmap and library decisions
- `docs/frontend-initial-idea.md` -- Product concept and UI requirements
