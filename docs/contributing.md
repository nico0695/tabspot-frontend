# Contributing

Code conventions, quality tools, and development workflow for TabSpot frontend.

## Code Quality Tools

### ESLint

- Version: v9, flat config (`eslint.config.mjs`)
- Extends: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`, `eslint-config-prettier`
- Run: `pnpm lint`

### Prettier

- Version: v3.8, config in `.prettierrc`
- Single quotes, 100 char width, trailing commas, semicolons
- Run `pnpm format` to write fixes, `pnpm format:check` to verify without writing

### Husky + lint-staged

- Pre-commit hook runs Prettier format then ESLint fix on staged files
- File pattern: `*.{ts,tsx,mjs,css,json,md}`
- Do not bypass with `--no-verify` unless you have a strong reason

### TypeScript

- Version: v5, strict mode enabled
- `strict: true` in `tsconfig.json`
- Path alias: `@/*` maps to `./src/*`
- Fix all type errors before committing

### Vitest

- Version: v4.1, config in `vitest.config.mts`
- Environment: happy-dom
- Run `pnpm test` for a single run, `pnpm test:watch` for watch mode
- Place tests in `src/__tests__/` or colocate them next to the source file

## File Naming Conventions

| Category      | Pattern                     | Example                          |
| ------------- | --------------------------- | -------------------------------- |
| Feature files | `{module}.{concern}.ts`     | `songs.api.ts`, `songs.hooks.ts` |
| Components    | PascalCase directory + file | `Button/Button.tsx`              |
| CSS Modules   | `{Component}.module.css`    | `Button.module.css` (colocated)  |
| Stores        | `use{Name}Store.ts`         | `useUIStore.ts`                  |
| Hooks         | `use{Name}.ts`              | `useAuth.ts`                     |
| Constants     | `{module}.constants.ts`     | `songs.constants.ts`             |
| Types         | `{module}.types.ts`         | `songs.types.ts`                 |
| Utilities     | `{module}.utils.ts`         | `songs.utils.ts`                 |

## Module Conventions

See `project-structure.md` for the full directory layout.

- **Feature modules**: NO barrel exports. Import directly from the concern file (`songs.api.ts`, not `index.ts`).
- **UI components**: YES barrel exports. Each component directory has an `index.ts`.
- **Constants**: extract to `{module}.constants.ts` when 2 or more constants exist.
- **Types**: always in `{module}.types.ts`. Never define types inline in API or hook files.
- **Pure functions**: module-specific helpers go in `{module}.utils.ts`. Cross-module utilities go in `src/lib/`.
- **Inline sub-components**: only acceptable if under 50 lines of JSX.

## Styling Rules

- Use CSS Modules only. No Tailwind, no inline styles, no utility classes.
- Always reference design tokens: `var(--token-name)`. Never hardcode color, spacing, or font values.
- Variant classes use the `.v_` prefix: `.v_primary`, `.v_danger`.
- Size classes use the `.s_` prefix: `.s_sm`, `.s_md`, `.s_lg`.
- Colocate component styles: `Component.module.css` sits next to `Component.tsx`.

## Component Patterns

- Props interfaces extend HTML attributes where applicable (e.g., `extends React.ButtonHTMLAttributes<HTMLButtonElement>`).
- Use `useId()` from React for stable, unique IDs (required for accessibility).
- Use Radix UI for accessible primitives: modals, dropdowns, selects, tooltips.
- Apply custom styles on top of Radix components via CSS Modules.
- Keep components focused. Extract sub-components into their own files if they exceed 50 lines of JSX.

## Data Patterns

### Server Data

- Use React Query for all server data. Do not use manual `fetch` + `useState` patterns.
- API functions are pure functions in `{feature}.api.ts`. They accept params and return typed responses.
- React Query hooks live in `{feature}.hooks.ts` with a consistent query key strategy.

### Client State

- Use Zustand only for client-side state (auth status, UI toggles, preferences).
- Store files follow the `use{Name}Store.ts` naming convention.

### Forms

- Use React Hook Form with Zod schemas and `zodResolver`.
- Define form schemas in `{feature}.types.ts` or a dedicated `{feature}.schemas.ts`.

## Stack Decisions

These libraries are pre-decided. Do not substitute without team discussion.

| Decided     | Do NOT use                           |
| ----------- | ------------------------------------ |
| CSS Modules | Tailwind, styled-components, emotion |
| Zustand     | Redux, Jotai, Recoil                 |
| React Query | SWR, Apollo                          |
| date-fns    | Day.js, Moment.js                    |
| Zod         | Yup, Joi                             |
| Radix UI    | Headless UI, Chakra, MUI             |
| pnpm        | npm, yarn                            |
| Vitest      | Jest                                 |

If someone requests an alternative, flag the conflict with this table before proceeding.

## Commit Conventions

- Use conventional commits: `type(scope): description`
- Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`
- Scope matches the feature area: `auth`, `catalog`, `admin`, `ui`, `config`, `tabs`
- Keep commits focused and atomic. One logical change per commit.
- Write the description in imperative mood: "add feature" not "added feature"

### Examples

```
feat(catalog): add search filters to song listing
fix(auth): handle expired session redirect
refactor(admin): extract table columns to constants
test(tabs): add unit tests for chord transposition
docs(config): update environment variable reference
```

## Development Workflow

1. Create a feature branch from `main`.
2. Make changes following the conventions above.
3. Verify locally:
   - `pnpm lint` -- no lint errors
   - `pnpm format:check` -- formatting is correct
   - `pnpm test` -- all tests pass
   - `pnpm build` -- build succeeds without type errors
4. Commit with a conventional commit message.
5. Push and open a pull request against `main`.

The pre-commit hook handles formatting and linting automatically on staged files. If it fails, fix the reported issues before committing.
