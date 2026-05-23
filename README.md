# TabSpot Frontend

A ChordPro-based tablature and score web application for musicians. TabSpot provides a dark-first, stage-ready interface for browsing, managing, and rendering musical scores with live chord transposition.

## Features

- **Authentication** -- Login and registration via Supabase with role-based access control (USER / ADMIN).
- **Public Catalog** -- Browse songs and artists with infinite scroll, search, and filtering.
- **Admin Panel** -- Full CRUD management for songs, genres, artists, and users.
- **Design System** -- Dark-first theme built on CSS custom properties with 20+ reusable UI components.
- **API Integration** -- REST client with JWT authentication, cursor and offset pagination support.

## Tech Stack

| Library              | Version | Purpose                            |
| -------------------- | ------- | ---------------------------------- |
| Next.js              | 16.2.4  | App Router, SSR, routing           |
| React                | 19.2.4  | UI rendering                       |
| TypeScript           | 5.x     | Type safety (strict mode)          |
| CSS Modules          | --      | Component-scoped styling           |
| Radix UI             | latest  | Accessible UI primitives           |
| Supabase             | 2.x     | Authentication, session management |
| TanStack React Query | 5.x     | Server state, data fetching        |
| TanStack React Table | 8.x     | Table rendering and pagination     |
| Zustand              | 5.x     | Client-side state management       |
| React Hook Form      | 7.x     | Form state and validation          |
| Zod                  | 4.x     | Schema validation                  |
| next-themes          | 0.4.x   | Dark/light theme switching         |
| date-fns             | 4.x     | Date formatting                    |
| lucide-react         | 1.x     | Icons                              |
| Vitest               | 4.x     | Unit and integration testing       |
| ESLint + Prettier    | --      | Linting and formatting             |
| Husky + lint-staged  | --      | Pre-commit hooks                   |

## Quick Start

### Prerequisites

- Node.js (v20 or later recommended)
- pnpm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd tabspot-frontend

# Install dependencies
pnpm install

# Configure environment variables
cp .env.local.example .env.local
```

Edit `.env.local` and set the required variables:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_API_BASE_URL=<your-api-base-url>
```

### Run

```bash
pnpm dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `pnpm dev`        | Start the development server   |
| `pnpm build`      | Create a production build      |
| `pnpm start`      | Serve the production build     |
| `pnpm lint`       | Run ESLint                     |
| `pnpm format`     | Format all files with Prettier |
| `pnpm test`       | Run tests once (Vitest)        |
| `pnpm test:watch` | Run tests in watch mode        |

## Project Structure

```
src/
  app/             Next.js App Router (routes, layouts, pages)
  components/
    ui/            Generic UI components (buttons, inputs, modals, etc.)
    catalog/       Catalog-specific display components
    crud/          Reusable CRUD table and form components
    providers/     React context providers (query, theme, auth)
  features/
    admin/         Admin panel logic (songs, genres, artists, users)
    auth/          Authentication flows (login, register, session)
    catalog/       Public catalog logic (listings, search, filters)
    tabs/          ChordPro parser, transpose, scroll controls
  hooks/           Shared custom hooks
  lib/             API clients, Supabase config, utilities
  store/           Zustand stores
  styles/          Global styles and design tokens
  __tests__/       Test files
```

## Documentation

- [Architecture](./architecture.md) -- System architecture, patterns, and data flow
- [Project Structure](./project-structure.md) -- Directory layout, naming conventions, decomposition rules
- [Getting Started](./getting-started.md) -- Prerequisites, setup, and local development
- [Design System](./design-system.md) -- Tokens, theming, and component catalog
- [Data Layer](./data-layer.md) -- API client, React Query, pagination, error handling
- [Authentication](./auth.md) -- Supabase integration, route protection, session management
- [Contributing](./contributing.md) -- Code conventions, quality tools, workflow

## License

TBD
