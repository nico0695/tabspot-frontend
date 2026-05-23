# Data Layer

API client, data fetching patterns, React Query integration, and error handling.

---

## 1. API Client

**File:** `src/lib/api/client.ts`

Centralized HTTP client wrapping `fetch`. Every request auto-injects the JWT Bearer token from the current Supabase session and sets `Content-Type: application/json`.

```ts
export const apiClient = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST',   body: ... }),
  put:    <T>(path: string, body: unknown)  => request<T>(path, { method: 'PUT',    body: ... }),
  patch:  <T>(path: string, body: unknown)  => request<T>(path, { method: 'PATCH',  body: ... }),
  delete: (path: string)                    => request<void>(path, { method: 'DELETE' }),
};
```

- Base URL read from `env.NEXT_PUBLIC_API_BASE_URL`.
- Token obtained via `supabase.auth.getSession()` on each request; missing token is silently omitted (public endpoints).
- Non-2xx responses throw `ApiError`.
- 204 responses return `undefined`.

---

## 2. API Error Handling

Two complementary modules handle errors:

### ApiError class (`src/lib/api/types.ts`)

```ts
class ApiError extends Error {
  readonly status: number; // HTTP status
  readonly code: string; // backend error code
  readonly fields?: FieldError[]; // per-field validation errors
}
```

### Error messages and parsing (`src/lib/api/errors.ts`)

`parseApiError(status, body)` extracts a structured `ApiError` from a raw response body string. The class exposes a `userMessage` getter that maps error codes to Spanish-language user-facing strings.

| Error Code            | User Message (Spanish)                                  |
| --------------------- | ------------------------------------------------------- |
| INVALID_TOKEN         | Tu sesion es invalida. Intenta iniciar sesion de nuevo. |
| TOKEN_EXPIRED         | Tu sesion expiro. Inicia sesion de nuevo.               |
| UNAUTHORIZED          | No tenes permisos para realizar esta accion.            |
| FORBIDDEN             | Acceso denegado.                                        |
| NOT_FOUND             | El recurso solicitado no existe.                        |
| USER_NOT_FOUND        | Usuario no encontrado.                                  |
| VALIDATION_ERROR      | Los datos enviados no son validos.                      |
| INTERNAL_SERVER_ERROR | Error del servidor. Intenta de nuevo mas tarde.         |

### FieldError interface

```ts
interface FieldError {
  field: string;
  message: string;
}
```

Used for form-level validation errors. The backend returns an array of `FieldError` in the `error.fields` property when `code` is `VALIDATION_ERROR`.

---

## 3. Pagination Types

**File:** `src/lib/api/types.ts`

### Cursor-based (public catalog)

```ts
interface CursorPage<T> {
  data: T[];
  pageInfo: { nextCursor: string | null; hasMore: boolean };
}
```

Used by public listing endpoints (`/api/v1/songs`, `/api/v1/artists`). Consumed via `useInfiniteQuery`.

### Offset-based (admin tables)

```ts
interface OffsetPage<T> {
  data: T[];
  pageInfo: { page: number; pageSize: number; totalCount: number; totalPages: number };
}
```

Used by admin endpoints (`/api/v1/admin/songs`, `/api/v1/admin/artists`, etc.). Consumed via standard `useQuery` with page/pageSize params.

---

## 4. Server-Side Fetching

**File:** `src/lib/api/server.ts`

Guarded with `import 'server-only'`. Provides `serverFetch<T>(path)` wrapped in React `cache()` for per-request deduplication across RSC tree traversals.

```ts
export const fetchSongBySlug = cache((slug: string) =>
  serverFetch<SongDetail>(`/api/v1/songs/${slug}`),
);
export const fetchArtistBySlug = cache((slug: string) =>
  serverFetch<ArtistDetail>(`/api/v1/artists/${slug}`),
);
```

Behavior:

- Returns `null` on 404, allowing the page component to call `notFound()`.
- Throws `ApiError` on other non-2xx responses.
- No auth token -- these hit public endpoints only.
- Used by server components for initial page data and `generateMetadata`.

A separate `fetchWithAuth<T>(token, path)` helper exists in `src/lib/api/fetcher.ts` for server-side calls that require authentication.

---

## 5. React Query Setup

**File:** `src/lib/api/query-client.ts`

```ts
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  });
}
```

A `QueryProvider` component wraps the app in the root layout and supplies the client. React Query DevTools are included in development builds.

---

## 6. Feature Hooks Pattern

Each feature exposes hooks in `{feature}.hooks.ts` that wrap React Query primitives.

### Query hooks

```ts
// Paginated list with filter params
export function useAdminSongs(params?: ListAdminSongsParams) {
  return useQuery({
    queryKey: [...ADMIN_SONGS_KEY, params],
    queryFn: () => listAdminSongs(params),
  });
}

// Select options (all items, maps to { value, label })
export function useArtistSelectOptions() {
  return useQuery({
    queryKey: ADMIN_ARTISTS_ALL_KEY,
    queryFn: async (): Promise<ArtistSelectOption[]> => {
      const artists = await listAllArtists();
      return artists.map((a) => ({ value: a.id, label: a.name }));
    },
  });
}
```

### Mutation hooks

```ts
export function useCreateSong() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SONGS_KEY });
    },
  });
}
```

Mutations always invalidate relevant query keys on success. When a resource has both a list key and an "all" key (e.g., artists), both are invalidated.

### Infinite queries (catalog)

```ts
export function useSongs(params?: Omit<ListSongsParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: [...CATALOG_SONGS_KEY, params],
    queryFn: ({ pageParam }) => listSongs({ ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });
}
```

---

## 7. Query Key Strategy

Keys follow the convention `[scope, resource, qualifier?, params?]`.

| Scope     | Example Key                              | Usage                   |
| --------- | ---------------------------------------- | ----------------------- |
| `admin`   | `['admin', 'songs', params]`             | Admin paginated list    |
| `admin`   | `['admin', 'artists', 'all']`            | All artists for selects |
| `admin`   | `['admin', 'genres', 'list', params]`    | Admin genres list       |
| `catalog` | `['catalog', 'songs', params]`           | Public song listing     |
| `catalog` | `['catalog', 'song', slug]`              | Single song detail      |
| `catalog` | `['catalog', 'artists', 'list', params]` | Public artist listing   |
| `catalog` | `['catalog', 'artist', slug]`            | Single artist detail    |
| `catalog` | `['catalog', 'genres']`                  | All genres (filter UI)  |

Keys are defined as `const` tuples at the top of each hooks file:

```ts
const ADMIN_SONGS_KEY = ['admin', 'songs'] as const;
```

---

## 8. Feature API Functions

Each feature has a `{feature}.api.ts` file containing pure async functions that call `apiClient`.

```ts
const BASE_PATH = '/api/v1/admin/songs';

listAdminSongs(params?)      -> apiClient.get<OffsetPage<AdminSong>>(BASE_PATH + qs)
getAdminSong(id)             -> apiClient.get<AdminSong>(`${BASE_PATH}/${id}`)
createSong(data)             -> apiClient.post<AdminSong>(BASE_PATH, data)
updateSong(id, data)         -> apiClient.patch<AdminSong>(`${BASE_PATH}/${id}`, data)
deleteSong(id)               -> apiClient.delete(`${BASE_PATH}/${id}`)
```

Query parameters are built with `URLSearchParams`, appending only non-nullish values.

---

## 9. Backend API Overview

| Aspect    | Detail                         |
| --------- | ------------------------------ |
| Base path | `/api/v1`                      |
| Auth      | JWT Bearer token (Supabase)    |
| Format    | JSON request/response          |
| Full spec | `openapi.json` in project root |

### Endpoint scopes

| Scope            | Path prefix                                          | Auth required | Pagination |
| ---------------- | ---------------------------------------------------- | ------------- | ---------- |
| Public catalog   | `/api/v1/songs`, `/api/v1/artists`, `/api/v1/genres` | No            | Cursor     |
| User (protected) | `/api/v1/me/*`                                       | Yes           | Varies     |
| Admin            | `/api/v1/admin/*`                                    | Yes (ADMIN)   | Offset     |

### Key resources

`genres`, `artists`, `songs`, `tabs`, `users`, `search`

---

## 10. Enums

**File:** `src/lib/api/enums.ts`

Enums are defined as `const` objects with derived union types.

| Enum       | Values                              |
| ---------- | ----------------------------------- |
| UserRole   | USER, ADMIN                         |
| UserStatus | ACTIVE, BLOCKED                     |
| TabType    | CHORDS, TAB, MIXED                  |
| Instrument | GUITAR, BASS, UKULELE, PIANO        |
| Difficulty | BEGINNER, INTERMEDIATE, ADVANCED    |
| TabStatus  | DRAFT, PENDING, PUBLISHED, REJECTED |

```ts
export const UserRole = { USER: 'USER', ADMIN: 'ADMIN' } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
```

---

## Module Barrel

**File:** `src/lib/api/index.ts`

Re-exports `apiClient`, `makeQueryClient`, pagination types, `ApiError`, and all enums. Feature code imports from `@/lib/api` rather than individual files.
