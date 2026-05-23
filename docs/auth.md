# Authentication

Authentication architecture, Supabase integration, state management, and route
protection for the TabSpot Frontend.

---

## 1. Overview

- **Identity provider:** Supabase (email/password credentials)
- **Token format:** JWT Bearer, issued by Supabase and validated by the backend
- **Two Supabase clients:** browser (client-side auth actions) and server (cookie-based session for middleware)
- **State management:** Zustand store persisted to localStorage
- **Route protection:** two layers -- server-side middleware and client-side layout guards

---

## 2. Supabase Clients

### Browser Client (`src/lib/supabase/client.ts`)

Uses `createBrowserClient()` from `@supabase/ssr`. Initialized with
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (validated at
build time by `lib/env.ts`). All client-side auth operations -- login, register,
logout, token retrieval -- go through this client.

### Server Client (`src/lib/supabase/server.ts`)

Uses `createServerClient()` from `@supabase/ssr` with the Next.js `cookies()`
API for cookie-based session management. The middleware (`proxy.ts`) uses this
client to read the current session and decide whether to allow, redirect, or
block the request. No auth actions are performed server-side; the server client
is read-only.

---

## 3. Auth Store (`src/store/useAuthStore.ts`)

Zustand store that owns all auth state and exposes auth actions.

### State

| Field             | Type             | Description                            |
| ----------------- | ---------------- | -------------------------------------- |
| `user`            | `User \| null`   | User profile from `/api/v1/me`         |
| `token`           | `string \| null` | JWT access token from Supabase session |
| `isAuthenticated` | `boolean`        | Whether a valid session exists         |
| `isLoading`       | `boolean`        | In-flight auth operation               |
| `error`           | `string \| null` | Last auth error message                |

### Actions

| Action                              | Description                                                     |
| ----------------------------------- | --------------------------------------------------------------- |
| `loginSupabase(email, password)`    | Sign in via Supabase, then fetch user from `/api/v1/me`         |
| `registerSupabase(email, password)` | Sign up via Supabase, then fetch user                           |
| `logoutSupabase()`                  | Sign out of Supabase, clear all auth state                      |
| `validateSession()`                 | Compare stored token against Supabase session; refresh if stale |
| `clearError()`                      | Reset error state to `null`                                     |

### Persistence

The store uses Zustand `persist()` middleware with these settings:

- **Persisted fields:** `user`, `token`, `isAuthenticated` (via `partialize`)
- **Excluded fields:** `isLoading`, `error` (transient state)
- **`skipHydration: true`** -- store is not auto-rehydrated on mount. Layouts
  call `useAuthStore.persist.rehydrate()` manually to prevent SSR/client
  mismatch on hydration

---

## 4. Login and Register Flow

```
User submits form
       |
       v
Zod schema validates input (react-hook-form + @hookform/resolvers)
       |
       v
Auth store calls Supabase SDK
  loginSupabase()  -->  supabase.auth.signInWithPassword()
  registerSupabase()  -->  supabase.auth.signUp()
       |
       v
Extract access_token from Supabase session
       |
       v
Fetch user profile: GET /api/v1/me (Bearer token)
  Returns: { id, email, displayName, role, status }
       |
       v
Store user + token in Zustand (persisted to localStorage)
       |
       v
Redirect to home page (/)
```

Both login and register pages live under the `(auth)` route group, which
provides a centered layout with no navigation chrome. Form validation schemas
are defined in `src/features/auth/auth.schema.ts`.

---

## 5. Route Protection

### Server-side: Middleware (`src/proxy.ts`)

Runs on every incoming request before rendering.

**Protected patterns** (require authentication):

- `/profile/*`
- `/tabs/create`
- `/tabs/edit/*`
- `/admin/*`

**Auth pages** (redirect away if already authenticated):

- `/login`
- `/register`

**Logic:**

```
Request arrives
       |
       v
Is the route a protected pattern?
  YES --> Is user authenticated (Supabase session cookie)?
            YES --> Allow request
            NO  --> Redirect to /login?redirectTo={original_path}
  NO  --> Is it an auth page (/login, /register)?
            YES --> Is user authenticated?
                      YES --> Redirect to /
                      NO  --> Allow request
            NO  --> Allow request
```

The middleware also manages Supabase session cookies by calling
`supabase.auth.getUser()`, which refreshes expired tokens and updates
the cookie automatically.

### Client-side: Admin Layout Guard (`src/app/admin/layout.tsx`)

After the middleware allows the request, the admin layout performs a
client-side role check:

- Reads `isAuthenticated` and `user.role` from the auth store
- If `!isAuthenticated || user.role !== 'ADMIN'`, redirects to `/`
- Handles the hydration gap (store not yet rehydrated) by showing a
  loading state until `skipHydration` completes

### Client-side: Auth Layout (`src/app/(auth)/layout.tsx`)

- Calls `useAuthStore.persist.rehydrate()` on mount
- Provides centered layout styling for login and register forms
- No redirect logic (handled by middleware)

---

## 6. Token Injection

The API client (`src/lib/api/client.ts`) handles token injection transparently.
Feature code never manages tokens directly.

1. Before each request, `apiClient` calls an internal `getToken()` function
2. `getToken()` retrieves the current session from the Supabase browser client
3. The access token is attached as `Authorization: Bearer <token>`
4. If no session exists, the request is sent without an auth header

See `data-layer.md` for full API client architecture.

---

## 7. Roles and Permissions

| Role    | Access Level                                         |
| ------- | ---------------------------------------------------- |
| `USER`  | Default role. Access to public pages and own profile |
| `ADMIN` | Full access including `/admin/*` routes              |

| Status    | Effect                    |
| --------- | ------------------------- |
| `ACTIVE`  | Normal access             |
| `BLOCKED` | Account disabled by admin |

- Role assignment: `PUT /api/v1/admin/users/{id}/role`
- Status changes: `PUT /api/v1/admin/users/{id}/status`
- Role is checked client-side in the admin layout guard
- The backend independently validates role on admin endpoints

---

## 8. Session Lifecycle

| Event              | Behavior                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| Page reload        | Token restored from localStorage; store rehydrated in layout           |
| Layout mount       | `validateSession()` checks if stored token matches Supabase session    |
| Token expiry       | Supabase SDK auto-refreshes via refresh token                          |
| Token mismatch     | `validateSession()` fetches fresh user profile from `/api/v1/me`       |
| Logout             | Supabase `signOut()` called; Zustand state cleared; localStorage wiped |
| Browser tab return | Supabase `onAuthStateChange` listener handles stale sessions           |

---

## Related Docs

- `docs-v2/architecture.md` -- Full architecture overview including auth section
- `docs/module-conventions.md` -- Feature module file naming conventions
- `data-layer.md` -- API client, server fetcher, and pagination details
