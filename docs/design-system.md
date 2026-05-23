# Design System

Reference for TabSpot's design token system, theming architecture, and UI component catalog.

See [getting-started.md](./getting-started.md) for project setup.

---

## 1. Design Philosophy

TabSpot follows a **"Stage Focus"** design language, optimized for musicians actively playing an instrument.

Core constraints:

- **Dark-first** -- dark theme is the default; light is secondary.
- **Monospace mandatory** for score rendering -- chord-over-lyric alignment depends on fixed-width characters.
- **Touch targets >= 56x56 px** -- operable with picks, fingers on stands, or sweaty hands.
- **Score line-height >= 250%** -- room for floating chord notation above lyric lines.
- Minimal, utilitarian, technical aesthetic. No decoration for decoration's sake.

---

## 2. Design Tokens

All tokens are native CSS custom properties defined in `src/styles/tokens/`. Each concern has its own file.

### Colors (`colors.css`)

Dark theme values (`:root` default):

```css
/* Backgrounds */
--bg: #111315;
--surface: #1a1d21;
--surface-2: #14171a;

/* Text */
--text: #e2e8f0;
--text-2: #94a3b8;
--text-3: #64748b;

/* Borders */
--border: rgba(226, 232, 240, 0.08);
--border-strong: rgba(226, 232, 240, 0.14);

/* Accent -- Chord */
--accent-chord: #188a8a;
--accent-chord-soft: rgba(24, 138, 138, 0.16);

/* Accent -- Control */
--accent-ctrl: #2a6b91;
--accent-ctrl-strong: #337fab;
--accent-ctrl-soft: rgba(42, 107, 145, 0.22);

/* Semantic */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

Light theme overrides are scoped to `[data-theme='light']` with inverted values.

### Typography (`typography.css`)

```css
/* Font families */
--font-ui: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Sizes */
--fs-xs: 12px;
--fs-sm: 14px;
--fs-md: 16px;
--fs-lg: 20px;
--fs-xl: 24px;
--fs-2xl: 32px;

/* Weights */
--fw-regular: 400;
--fw-medium: 500;
--fw-semibold: 600;
--fw-bold: 700;

/* Line heights */
--lh-tight: 1.2;
--lh-normal: 1.5;
--lh-relaxed: 1.7;
--lh-score: 2.5; /* score rendering -- chord above lyric */
```

`--font-ui` is used for all interface text. `--font-mono` is used for code snippets and score rendering.

### Spacing (`spacing.css`)

8px base grid:

```css
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 48px;
--space-6: 64px;
```

### Radius (`radius.css`)

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 999px;
```

### Shadows (`shadows.css`)

```css
--shadow-1: /* subtle -- cards, inputs */;
--shadow-2: /* elevated -- modals, dropdowns */;
```

### Motion (`motion.css`)

```css
--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
--t-micro: 120ms;
--t-base: 200ms;
```

---

## 3. Theming

| Aspect           | Value                                       |
| ---------------- | ------------------------------------------- |
| Provider         | `next-themes` via `ThemeProvider` component |
| HTML attribute   | `data-theme` on `<html>` (not class-based)  |
| Default theme    | `dark`                                      |
| System detection | Enabled                                     |
| FOUC prevention  | `disableTransitionOnChange: true`           |

CSS selector pattern:

```css
/* Dark (default) */
:root {
  --bg: #111315;
}

/* Light */
[data-theme='light'] {
  --bg: #fafafa;
}
```

---

## 4. Styling Conventions

**CSS Modules only** -- every component gets a `ComponentName.module.css` file. No utility classes, no inline styles, no Tailwind.

Rules:

- All values must reference tokens: `var(--token-name)`. Never hardcode hex codes or pixel values directly in component styles.
- Variant classes use the `.v_` prefix: `.v_primary`, `.v_secondary`, `.v_ghost`, `.v_danger`.
- Size classes use the `.s_` prefix: `.s_sm`, `.s_md`.
- State selectors use data attributes: `[data-state]`, `[data-highlighted]`, `[data-disabled]`.
- Focus style: `2px` outline with `var(--accent-ctrl)`, `2px` offset.
- Tinted backgrounds use modern CSS: `color-mix(in oklab, var(--accent-ctrl) 12%, transparent)`.

---

## 5. Component Catalog

All UI primitives live under `src/components/ui/`. Each component is a directory containing the component file, its CSS Module, an `index.ts` barrel, and optionally a types file.

### Primitives

| Component   | Variants                                        | Sizes       | Path                        |
| ----------- | ----------------------------------------------- | ----------- | --------------------------- |
| Button      | primary, secondary, ghost, danger, danger-ghost | sm, md      | `components/ui/Button`      |
| Input       | text, password (eye toggle), search             | md, compact | `components/ui/Input`       |
| Select      | --                                              | --          | `components/ui/Select`      |
| MultiSelect | --                                              | --          | `components/ui/MultiSelect` |
| Checkbox    | --                                              | --          | `components/ui/Checkbox`    |
| Toggle      | --                                              | --          | `components/ui/Toggle`      |
| Textarea    | --                                              | --          | `components/ui/Textarea`    |
| FormField   | --                                              | --          | `components/ui/FormField`   |
| IconButton  | --                                              | --          | `components/ui/IconButton`  |

### Feedback

| Component  | Variants                                                       | Sizes  | Path                       |
| ---------- | -------------------------------------------------------------- | ------ | -------------------------- |
| Spinner    | --                                                             | sm, md | `components/ui/Spinner`    |
| Badge      | default, draft, pending, published, rejected, instrument, type | --     | `components/ui/Badge`      |
| Chip       | --                                                             | --     | `components/ui/Chip`       |
| Toast      | success, error, warning, info                                  | --     | `components/ui/Toast`      |
| EmptyState | --                                                             | --     | `components/ui/EmptyState` |

### Overlay / Layout

| Component        | Variants                            | Sizes | Path                             |
| ---------------- | ----------------------------------- | ----- | -------------------------------- |
| Modal            | --                                  | --    | `components/ui/Modal`            |
| DropdownMenu     | --                                  | --    | `components/ui/DropdownMenu`     |
| Tooltip          | --                                  | --    | `components/ui/Tooltip`          |
| Card             | compound: Header, Description, Body | --    | `components/ui/Card`             |
| Pagination       | --                                  | --    | `components/ui/Pagination`       |
| SegmentedControl | --                                  | --    | `components/ui/SegmentedControl` |

### CRUD Composites

Higher-level components for admin/data views, located under `src/components/crud/`:

- **DataTable** (`components/crud/DataTable`) -- sortable columns, integrated pagination, per-row action menus.
- **FormBuilder** (`components/crud/FormBuilder`) -- generates forms dynamically from an array of field configuration objects. Pairs with `react-hook-form` and Zod schemas.

---

## 6. Icon System

Library: **Lucide React** (`lucide-react`).

Import individual icons to keep bundle size minimal:

```tsx
import { Search, ChevronDown } from 'lucide-react';
```

Do not import the entire icon library.
