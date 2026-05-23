# Project Structure

Directory layout, naming conventions, and module decomposition rules for the TabSpot frontend.

For architectural rationale behind these decisions, see [architecture.md](./architecture.md).

---

## Directory Tree

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth route group (login, register)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (public)/                     # Public catalog route group
│   │   ├── songs/                    # Song listing + [slug] detail
│   │   ├── artists/                  # Artist listing + [slug] detail
│   │   ├── Navbar/                   # Public navbar component
│   │   └── layout.tsx
│   ├── admin/                        # Admin panel (protected)
│   │   ├── songs/                    # CRUD pages + components/
│   │   ├── genres/
│   │   ├── artists/
│   │   ├── users/
│   │   ├── demo/                     # Design system playground
│   │   ├── layout.tsx                # Auth guard + admin layout
│   │   └── page.tsx                  # Dashboard
│   ├── layout.tsx                    # Root layout (providers, fonts)
│   ├── page.tsx                      # Home page
│   ├── globals.css                   # Token imports entry point
│   └── favicon.ico
├── components/
│   ├── ui/                           # Primitive components (20)
│   │   ├── Button/                   # Each: Component.tsx + Component.module.css + index.ts
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Select/
│   │   ├── MultiSelect/
│   │   ├── Checkbox/
│   │   ├── Toggle/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Chip/
│   │   ├── FormField/
│   │   ├── Spinner/
│   │   ├── Textarea/
│   │   ├── DropdownMenu/
│   │   ├── IconButton/
│   │   ├── Pagination/
│   │   ├── Tooltip/
│   │   ├── Toast/
│   │   ├── SegmentedControl/
│   │   └── EmptyState/
│   ├── catalog/                      # Domain-specific: SongCard, ArtistCard, FilterBar, grids
│   ├── crud/                         # Generic CRUD: FormBuilder, DataTable
│   └── providers/                    # ThemeProvider, QueryProvider
├── features/
│   ├── auth/                         # schemas.ts, types.ts
│   ├── catalog/                      # catalog.api.ts, catalog.types.ts, catalog.hooks.ts
│   └── admin/
│       ├── songs/                    # songs.api.ts, songs.types.ts, songs.hooks.ts, songs.schema.ts, songs.columns.tsx, songs.utils.ts, songs.constants.ts
│       ├── genres/                   # Same pattern
│       ├── artists/                  # Same pattern
│       └── users/                    # Same pattern
├── hooks/                            # useDebounce.ts
├── lib/
│   ├── api/                          # client.ts, server.ts, fetcher.ts, query-client.ts, types.ts, errors.ts, enums.ts, index.ts
│   ├── supabase/                     # client.ts, server.ts
│   ├── env.ts                        # @t3-oss/env-nextjs validation
│   └── format.ts                     # Formatting utilities
├── store/                            # useAuthStore.ts, useUIStore.ts
├── styles/
│   ├── global.css                    # Imports tokens + reset, body styles
│   ├── reset.css                     # Modern CSS reset
│   └── tokens/                       # colors.css, typography.css, spacing.css, radius.css, shadows.css, motion.css
├── __tests__/                        # smoke.test.tsx
└── proxy.ts                          # Next.js middleware (auth routing)
```

---

## Naming Conventions

### Files

| Pattern                     | Example                          | Used for        |
| --------------------------- | -------------------------------- | --------------- |
| `{module}.{concern}.ts`     | `songs.api.ts`, `songs.hooks.ts` | Feature files   |
| `PascalCase/PascalCase.tsx` | `Button/Button.tsx`              | Components      |
| `{Component}.module.css`    | `Button.module.css`              | CSS Modules     |
| `use{Name}Store.ts`         | `useAuthStore.ts`                | Zustand stores  |
| `use{Name}.ts`              | `useDebounce.ts`                 | Custom hooks    |
| `page.tsx`                  | `page.tsx`                       | Next.js pages   |
| `layout.tsx`                | `layout.tsx`                     | Next.js layouts |

### Concern Suffixes (Feature Files)

| Suffix          | Content                                 |
| --------------- | --------------------------------------- |
| `.types.ts`     | TypeScript interfaces and type aliases  |
| `.api.ts`       | API call functions                      |
| `.hooks.ts`     | React Query hooks (queries + mutations) |
| `.schema.ts`    | Zod validation schemas                  |
| `.columns.tsx`  | TanStack Table column definitions       |
| `.utils.ts`     | Pure helper functions                   |
| `.constants.ts` | Static values, configs, labels          |

---

## Module Decomposition Rules

### When to extract

| Artifact                         | Threshold                                | Target                           |
| -------------------------------- | ---------------------------------------- | -------------------------------- |
| Constants                        | 2+ constants in a single file            | `{module}.constants.ts`          |
| Types                            | Any exported type                        | `{module}.types.ts`              |
| Pure functions (module-specific) | Any reusable logic                       | `{module}.utils.ts`              |
| Pure functions (cross-module)    | Used by 2+ features                      | `src/lib/`                       |
| Components                       | Reused, or file exceeds ~50 lines of JSX | Own `PascalCase/` folder         |
| Sub-components                   | Inline if <50 lines JSX                  | Extract to same folder if larger |

### Feature module anatomy (example: `features/admin/songs/`)

```
songs/
├── songs.api.ts          # fetchSongs(), createSong(), updateSong(), deleteSong()
├── songs.types.ts        # Song, SongFormValues, SongFilters
├── songs.hooks.ts        # useSongs(), useSongMutation()
├── songs.schema.ts       # songFormSchema (Zod)
├── songs.columns.tsx     # Column definitions for DataTable
├── songs.utils.ts        # formatDuration(), buildSongPayload()
└── songs.constants.ts    # DIFFICULTY_OPTIONS, STATUS_LABELS
```

---

## Barrel Export Policy

| Location          | Barrel (`index.ts`) | Import style                                                    |
| ----------------- | ------------------- | --------------------------------------------------------------- |
| `components/ui/*` | Yes                 | `import { Button } from '@/components/ui/Button'`               |
| `features/`       | No                  | `import { useSongs } from '@/features/admin/songs/songs.hooks'` |
| `lib/api/`        | Yes                 | `import { apiClient } from '@/lib/api'`                         |
| `lib/supabase/`   | No                  | `import { createClient } from '@/lib/supabase/client'`          |
| `store/`          | No                  | `import { useAuthStore } from '@/store/useAuthStore'`           |

---

## Path Aliases

Configured in `tsconfig.json`:

```json
{ "@/*": ["./src/*"] }
```

All imports use the `@/` prefix. Never use relative paths that escape the current module (no `../../`).

```ts
// Correct
import { Button } from '@/components/ui/Button';
import { useSongs } from '@/features/admin/songs/songs.hooks';

// Wrong
import { Button } from '../../components/ui/Button';
```

---

## Route Organization

### Route groups

| Group      | Path prefix           | Purpose                            |
| ---------- | --------------------- | ---------------------------------- |
| `(auth)`   | `/login`, `/register` | Shared auth layout, no URL segment |
| `(public)` | `/songs`, `/artists`  | Public catalog with shared navbar  |
| `admin/`   | `/admin/*`            | Protected admin panel              |

### Route conventions

- **Public detail pages** use `[slug]` dynamic segments (`/songs/[slug]`, `/artists/[slug]`).
- **Admin CRUD** uses modals for create/edit; entity `{id}` is handled client-side, not via route params.
- **Page-level components** are colocated in `{route}/components/` (e.g., `admin/songs/components/SongFormModal.tsx`).
- **Layouts** handle shared chrome: `(auth)/layout.tsx` for auth pages, `(public)/layout.tsx` for catalog, `admin/layout.tsx` for the admin shell with auth guard.

### Middleware

`src/proxy.ts` handles auth-based routing: redirects unauthenticated users from protected routes and authenticated users away from auth pages.
