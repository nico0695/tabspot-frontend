@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Versions matter

- **Next.js 16.2.4** + **React 19.2.4** — both newer than typical training data. Per `AGENTS.md`, consult `node_modules/next/dist/docs/` before writing framework code; do not assume Next 13/14/15 APIs still apply.
- Package manager: **pnpm** (see `pnpm-lock.yaml`, `pnpm-workspace.yaml`). Do not introduce npm/yarn lockfiles.

## Commands

```bash
pnpm install      # install
pnpm dev          # next dev (http://localhost:3000)
pnpm build        # next build
pnpm start        # next start (after build)
pnpm lint         # eslint (flat config, eslint.config.mjs)
```

There is no test runner yet. Vitest is planned (see roadmap) but not installed — do not add `pnpm test` to instructions until it exists.

## Project state

This is an **early-stage scaffold**. Only the `create-next-app` boilerplate exists:

- `app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`); Geist/Geist Mono fonts wired up; default metadata still says "Create Next App".
- `public/` — default SVG assets.
- No `src/`, no `features/`, no `lib/`, no `store/`, no Supabase/React Query/Zustand/Radix yet.

Implication: when adding code, you are likely **establishing** a convention rather than following one. Cross-check against `docs/frontend-init-proyect.md` (the setup roadmap) before inventing structure — most architectural decisions are pre-decided there even if not yet implemented.

## Product context (TabSpot)

A ChordPro-based **tablature/score app** for musicians. Two pieces are load-bearing for product correctness and must have tests as soon as Vitest lands:

1. **ChordPro parser** — turns ChordPro source into renderable structure.
2. **Chord transposition algorithm** — math-based, drives the live transpose UI.

UI is **"Stage Focus" / dark-first** (designed for use while playing an instrument):
- Monospace font is **mandatory** for score rendering (chord-over-lyric alignment depends on it).
- Touch targets ≥ **56×56 px**.
- Score line-height ≥ **250%** (room for floating chord above lyric).
- Use `next-themes` (planned) for theme; default dark, avoid FOUC.

## Planned architecture (Feature-Sliced Design)

Per `docs/frontend-initial-idea.md` and `docs/frontend-init-proyect.md`, code will live under `src/` once that migration happens:

```
src/
  app/         Next.js routes/layouts (move from current top-level app/)
  components/  Global UI (Radix primitives + CSS Modules)
    ui/        Generic buttons/inputs
  features/    Domain logic
    tabs/      ChordPro parser, scroll controls, transpose math
    auth/      Supabase session
    catalog/   Listings, search/filters
  lib/         Clients/config (Supabase, fetchers, env)
  store/       Zustand stores (e.g. useUIStore)
  styles/      Design tokens, global resets
```

**Path alias:** `tsconfig.json` currently maps `@/*` → `./*` (repo root). The roadmap calls for `@/*` → `./src/*` once `src/` exists — update both together when you do that migration; do not let the alias drift from the actual layout.

## Styling rules

- **CSS Modules only** (`*.module.css`). No Tailwind — explicitly rejected during init.
- **Radix UI primitives** for accessible behavior (modals, dropdowns, tooltips); supply your own styles via CSS Modules.
- Define design tokens as **native CSS variables** in `app/globals.css` (or `src/styles/` after migration).

## Stack to add (do not invent alternatives)

When a roadmap step lands, use exactly these libraries — they are pre-decided:

- Env validation: `@t3-oss/env-nextjs` + Zod (build must fail on missing vars).
- Forms: `react-hook-form` + `@hookform/resolvers` + Zod schemas.
- Server state: `@tanstack/react-query` (+ devtools).
- Client state: `zustand`.
- Auth/DB: `@supabase/supabase-js`.
- Dates: `date-fns`.
- Theming: `next-themes`.
- Tests: `vitest` + `@testing-library/react` + `happy-dom`/`jsdom`.
- Quality: ESLint + Prettier + Husky + lint-staged.

If the user asks for something equivalent (e.g. Jotai, SWR, Day.js, Tailwind), flag the conflict with the roadmap before substituting.

<!-- sdd-lite:start generated_at="2026-04-26T12:10:00Z" version="0.1" package_root="sdd-lite" -->
You are a development assistant with access to `sdd-lite`, a structured change workflow for bounded repo changes.

## When to use sdd-lite

Use the `sdd-lite` orchestrator (canonical contract at `sdd-lite/orchestrator/SDDL-ORCHESTRATOR.md`) when one of these is true:

- The user explicitly mentions sdd-lite: "use sdd", "con sdd-lite", "con sdd", "sddl", "hacerlo con sdd", or similar
- The user is starting a feature, refactor, or fix and seems uncertain about scope or approach
- The task spans multiple files, has unclear acceptance criteria, or carries non-trivial risk

Do NOT activate sdd-lite automatically for:

- Simple questions or explanations
- Quick one-line fixes the user clearly understands
- Conversational or exploratory requests

## When to suggest sdd-lite (without forcing it)

If a task looks substantial (new feature, broad refactor, bug with unknown root cause, multi-step change) and the user has not asked for structure, you may briefly offer:

> "This looks like a task where sdd-lite could help with structured planning. Want to use it, or should I proceed directly?"

If the user declines or ignores the suggestion, proceed without sdd-lite.

## When sdd-lite is active

Use the canonical orchestration contract at `sdd-lite/orchestrator/SDDL-ORCHESTRATOR.md` as the source of truth.
Use canonical skills under `sdd-lite/skills/`, runtime standards at `./sdd-lite/skill-catalog.md`, and schemas under `sdd-lite/schemas/`.

Rules:
- Run bootstrap preflight first. If bootstrap files are missing or unusable, stop and run `sddl-init`.
- Keep the orchestrator thin. Prefer reading only `./sdd-lite/openspec/config.yaml`, `./sdd-lite/user-prefs.yaml` (when present), `state.yaml`, `./sdd-lite/skill-catalog.md`, and artifact digests before choosing the next step.
- Recover context from persisted artifacts before asking the user for missing facts.
- Preserve checkpoints, approvals, resume behavior, and lifecycle semantics from the canonical contracts.
- Persisted artifacts must remain in English. Chat interaction may be `es` or `en`.
- Treat `./sdd-lite/skill-catalog.md` as the runtime standards registry. Reuse its compact rules instead of rediscovering project conventions in every stage.

## Delegation Policy

Default to fresh-worker delegation for real stage work.

- Inline only local routing decisions that need at most 3 repo files.
- Delegate to `sddl-deep-explorer` when routing or planning needs 4 or more files, or when a bounded unknown blocks the next safe step.
- Delegate `sddl-proposal-spec`, `sddl-design-plan`, `sddl-executor`, and `sddl-qa-review` as fresh workers by default.
- Do not perform multi-file edits inline in the orchestrator.
- Do not perform builds, installs, test suites, or broad validation inline in the orchestrator.
- Do not delegate per file; delegate per phase or per approved execution stage.

## Delegation Envelope

When launching a stage worker, pass a compact handoff:

- stage id
- `change_name`, objective, and selected route
- approved scope or blocked question
- artifact paths, not large artifact bodies
- short artifact digests
- `## Project Standards (auto-resolved)` copied from `./sdd-lite/skill-catalog.md`
- `## User Preferences (auto-resolved)` derived from `./sdd-lite/user-prefs.yaml` — relevant knobs for the target stage plus matching free rules; omit when the file is absent
- expected result fields: `status`, `executive_summary`, `artifacts`, `next_action`, `open_risks`

Do not paste the full README or broad repo summaries into each worker unless recovery truly requires it.
<!-- sdd-lite:end -->
