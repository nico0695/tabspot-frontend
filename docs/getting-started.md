# Getting Started

This guide covers prerequisites, installation, environment setup, and local development for TabSpot Frontend.

## 1. Prerequisites

Before you begin, make sure you have:

- **Node.js** (LTS recommended)
- **pnpm** -- the only supported package manager. Do not use npm or yarn.
- **A Supabase project** -- needed for authentication (URL + anon key)
- **TabSpot backend API** running locally (default: `http://localhost:3001`)

## 2. Installation

```bash
git clone <repo-url>
cd tabspot-frontend
pnpm install
```

## 3. Environment Setup

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Environment validation runs at build time via `@t3-oss/env-nextjs` + Zod. The build will fail if any variable is missing or invalid. The schema is defined in `src/lib/env.ts`.

## 4. Available Scripts

| Script       | Command             | Description                                |
| ------------ | ------------------- | ------------------------------------------ |
| Dev server   | `pnpm dev`          | Start Next.js dev server at localhost:3000 |
| Build        | `pnpm build`        | Production build                           |
| Start        | `pnpm start`        | Start production server (requires build)   |
| Lint         | `pnpm lint`         | Run ESLint (flat config)                   |
| Format       | `pnpm format`       | Format code with Prettier                  |
| Format check | `pnpm format:check` | Check formatting without writing           |
| Test         | `pnpm test`         | Run Vitest (single run)                    |
| Test watch   | `pnpm test:watch`   | Run Vitest in watch mode                   |

## 5. Development Workflow

1. Create a feature branch from `main`.
2. Run `pnpm dev` to start the dev server.
3. Make your changes. Pre-commit hooks (Husky + lint-staged) automatically run Prettier and ESLint on staged files.
4. TypeScript strict mode is enabled. Fix all type errors before committing.
5. CSS Modules (`*.module.css`) are the only styling approach. No utility-class frameworks.

## 6. Project Dependencies on Backend

- **Auth** requires a running Supabase instance. The frontend uses `@supabase/ssr` for session management.
- **API calls** go to the URL set in `NEXT_PUBLIC_API_BASE_URL` (TabSpot NestJS backend).
- The backend API spec is available in `openapi.json` at the repository root.

## 7. Common Issues

### Environment validation failed

Check that every variable in `.env.local` matches the Zod schema in `src/lib/env.ts`. Missing or malformed values cause the build to abort.

### Port 3000 already in use

Kill the existing process or start on a different port:

```bash
pnpm dev -- -p 3001
```

### pnpm not found

Install pnpm globally:

```bash
npm install -g pnpm
```

### Lockfile conflicts after switching branches

```bash
pnpm install --frozen-lockfile
```

If that fails, run `pnpm install` to regenerate the lockfile and commit the update.
