# TabSpot Design System

**Theme:** Stage Focus — Technical, minimal, utilitarian. Designed for musicians reading while playing.  
**Strategy:** Dark-first. All tokens default to dark mode; `[data-theme="light"]` overrides for daytime reading.

---

## Table of Contents

1. [Concept & Constraints](#1-concept--constraints)
2. [Color Tokens](#2-color-tokens)
3. [Typography](#3-typography)
4. [Spacing & Grid](#4-spacing--grid)
5. [Border Radius](#5-border-radius)
6. [Elevation & Shadows](#6-elevation--shadows)
7. [Effects](#7-effects)
8. [Motion](#8-motion)
9. [Components — Atoms](#9-components--atoms)
   - [Buttons](#buttons)
   - [IconButton](#iconbutton)
   - [Inputs](#inputs)
   - [Selection Controls](#selection-controls)
   - [Badges & Tags](#badges--tags)
   - [Filter Chips](#filter-chips)
10. [Components — Molecules](#10-components--molecules)
    - [ChordBlock](#chordblock)
    - [TranspositionStepper](#transpositionstepper)
    - [StarRating](#starrating)
    - [SongCard](#songcard)
    - [EmptyState](#emptystate)
11. [Components — Organisms](#11-components--organisms)
    - [GlobalTopNav](#globaltopnav)
    - [ScoreTopBar](#scoretopbar)
    - [BottomActionBar](#bottomactionbar)
    - [Modal / Dialog](#modal--dialog)
    - [AuthForm](#authform)
    - [AdminTable](#admintable)
12. [Score Renderer](#12-score-renderer)
13. [Page Layout](#13-page-layout)
14. [Implementation Rules](#14-implementation-rules)

---

## 1. Concept & Constraints

| Constraint        | Value                                                 | Reason                                                                  |
| ----------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Min touch target  | **56×56 px** (with invisible hitbox extension)        | Musician's finger precision in live performance                         |
| Score line-height | **2.5–2.8** (250%–280%)                               | Space for chord rendered above lyric without collision                  |
| Score font        | **JetBrains Mono / Fira Code** (monospace, mandatory) | Chord-to-syllable alignment depends on fixed-width characters           |
| UI font           | **Inter / system-ui**                                 | Clean legibility for navigation, forms, metadata                        |
| Theme switching   | `[data-theme="light"]` on `<html>`                    | next-themes must use `attribute: "data-theme"` (not `class`)            |
| Styling method    | **CSS Modules + CSS custom properties**               | No Tailwind — tokens consumed via `var(--token)` in `.module.css` files |

---

## 2. Color Tokens

### Dark Mode (`:root` — default)

| Token             | Value                    | Usage                                         |
| ----------------- | ------------------------ | --------------------------------------------- |
| `--bg`            | `#111315`                | Page background — charcoal, absorbs light     |
| `--surface`       | `#1A1D21`                | Cards, elevated surfaces                      |
| `--surface-2`     | `#14171A`                | Inputs, nested backgrounds, table headers     |
| `--text`          | `#E2E8F0`                | Primary text — off-white, high legibility     |
| `--text-2`        | `#94A3B8`                | Secondary text — metadata, labels, hints      |
| `--text-3`        | `#64748B`                | Tertiary text — placeholders, disabled labels |
| `--border`        | `rgba(226,232,240,0.08)` | Subtle dividers, card edges                   |
| `--border-strong` | `rgba(226,232,240,0.14)` | Focused borders, stronger dividers            |

### Accent Colors

| Token                  | Value                   | Usage                                               |
| ---------------------- | ----------------------- | --------------------------------------------------- |
| `--accent-chord`       | `#188A8A`               | Chord names, key indicators — teal, high legibility |
| `--accent-chord-soft`  | `rgba(24,138,138,0.16)` | Chord backgrounds, kicker pills                     |
| `--accent-ctrl`        | `#2A6B91`               | CTAs, primary buttons, focus rings — steel blue     |
| `--accent-ctrl-strong` | `#337FAB`               | Hover state for controls                            |
| `--accent-ctrl-soft`   | `rgba(42,107,145,0.22)` | Button hover backgrounds, soft states               |

### Semantic Colors

| Token       | Value     | Usage                                         |
| ----------- | --------- | --------------------------------------------- |
| `--success` | `#10B981` | Published, OK states                          |
| `--warning` | `#F59E0B` | Pending, star ratings, amber alerts           |
| `--error`   | `#EF4444` | Error states, danger buttons, rejected badges |

### Light Mode (`[data-theme="light"]` overrides)

| Token                  | Value                   |
| ---------------------- | ----------------------- |
| `--bg`                 | `#F8FAFC`               |
| `--surface`            | `#FFFFFF`               |
| `--surface-2`          | `#F1F5F9`               |
| `--text`               | `#0F172A`               |
| `--text-2`             | `#475569`               |
| `--text-3`             | `#64748B`               |
| `--border`             | `rgba(15,23,42,0.08)`   |
| `--border-strong`      | `rgba(15,23,42,0.14)`   |
| `--accent-chord`       | `#0D6464`               |
| `--accent-chord-soft`  | `rgba(13,100,100,0.12)` |
| `--accent-ctrl`        | `#1D4F73`               |
| `--accent-ctrl-strong` | `#2A6B91`               |
| `--accent-ctrl-soft`   | `rgba(29,79,115,0.14)`  |

> **Note:** `--success`, `--warning`, `--error` do not change between themes.

---

## 3. Typography

### Font Stacks

| Token         | Stack                                                           | Role                                                |
| ------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| `--font-ui`   | `'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`     | Navigation, forms, UI text                          |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, monospace` | Score rendering, chord names, code, metadata labels |

**Loading strategy:** Both fonts must be loaded via `next/font/google` (self-hosted, no CDN, zero CLS). The `--font-ui` and `--font-mono` CSS variables are injected via the font's `variable` option and applied on `<html>`. **Geist / Geist Mono (Next.js boilerplate) is replaced** — remove from `app/layout.tsx`.

```tsx
// app/layout.tsx (target shape after Fase 3)
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

> The fallback stacks (`system-ui`, `ui-monospace`) in the CSS variables remain — they kick in if the font fails to load.

### Type Scale

| Role             | Font          | Size                       | Weight | Notes                                    |
| ---------------- | ------------- | -------------------------- | ------ | ---------------------------------------- |
| H1 — Page title  | `--font-ui`   | 24px                       | 700    | `letter-spacing: -0.01em`                |
| H2 — Section     | `--font-ui`   | 18px                       | 600    |                                          |
| Body             | `--font-ui`   | 16px                       | 400    | Default line-height: 1.5                 |
| Small / Metadata | `--font-ui`   | 13px                       | 500    | `letter-spacing: 0.01em`                 |
| Chord name       | `--font-mono` | 16px (bold) / 18px (large) | 700    | Color: `--accent-chord`                  |
| Tab block        | `--font-mono` | 14px                       | 400    | `white-space: pre`, `line-height: 1.6`   |
| Labels / Kickers | `--font-mono` | 11–12px                    | 500    | `letter-spacing: 0.04–0.08em`, uppercase |

---

## 4. Spacing & Grid

### Spacing Scale (8px base grid)

| Token       | Value  | Common use                    |
| ----------- | ------ | ----------------------------- |
| `--space-1` | `8px`  | Icon gaps, small padding      |
| `--space-2` | `16px` | Standard padding, card gaps   |
| `--space-3` | `24px` | Section padding, column gaps  |
| `--space-4` | `32px` | Large padding                 |
| `--space-5` | `48px` | Section tops                  |
| `--space-6` | `64px` | Hero padding, page-level gaps |

### Touch Targets

- **Minimum interactive area:** 56×56 px
- **Visual element may be smaller** (e.g. 40px button) — extend hitbox invisibly via padding or `::before` pseudo-element
- Score controls (transpose stepper, play/pause FAB) must use `--lg` sizing

---

## 5. Border Radius

| Token          | Value   | Usage                                        |
| -------------- | ------- | -------------------------------------------- |
| `--radius-sm`  | `6px`   | Chips, small tags, icon buttons              |
| `--radius-md`  | `10px`  | Inputs, cards, rows                          |
| `--radius-lg`  | `16px`  | Large cards, FAB, modals                     |
| `--radius-2xl` | `24px`  | BottomActionBar, overlapping pill containers |
| _(pill)_       | `999px` | Badges, segmented controls, toggle tracks    |

---

## 6. Elevation & Shadows

| Token        | Value                          | Usage               |
| ------------ | ------------------------------ | ------------------- |
| `--shadow-1` | `0 2px 10px rgba(0,0,0,0.25)`  | Hover lift on cards |
| `--shadow-2` | `0 10px 40px rgba(0,0,0,0.45)` | Modals, hero frames |

> In dark mode, elevation is communicated primarily through surface color steps (`--bg` → `--surface-2` → `--surface`), not shadows. Shadows are a secondary signal.

---

## 7. Effects

### Background Gradient (body)

The page background uses two radial ambient glows anchored to the top corners:

```css
background-image:
  radial-gradient(1200px 600px at 15% -10%, rgba(24, 138, 138, 0.06), transparent 60%),
  radial-gradient(1000px 500px at 110% 10%, rgba(42, 107, 145, 0.05), transparent 60%);
```

Apply once on `body` or the root layout wrapper.

### Glassmorphism (BottomActionBar)

```css
background: color-mix(in oklab, var(--surface) 85%, transparent);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1px solid var(--border-strong);
```

Used exclusively on the `BottomActionBar`. Allows score content to be faintly visible through the bar while scrolling.

### Score Fade Gradients

Top and bottom fade overlays on the score pane to smooth entry/exit of lines:

```css
/* Top fade */
background: linear-gradient(var(--surface), transparent);
/* Bottom fade */
background: linear-gradient(transparent, var(--surface));
```

Height: ~32–40px. Position: `absolute`, `pointer-events: none`, `z-index: 2`.

---

## 8. Motion

| Token        | Value                      | Usage                                            |
| ------------ | -------------------------- | ------------------------------------------------ |
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` | Most interactions                                |
| `--t-micro`  | `120ms ease-out`           | Icon swaps, checkbox ticks                       |
| `--t-base`   | `200ms var(--ease-out)`    | Default — hover states, border color, background |

> **Rule:** UI transitions use `--t-base`. Score content has no transitions (performance + focus).

---

## 9. Components — Atoms

### Buttons

All buttons: `min-height: 44px`, `font: 600 14px var(--font-ui)`, `border-radius: var(--radius-md)`, `transition: var(--t-base)`.

| Variant      | Background      | Text       | Border            | Notes                                                                              |
| ------------ | --------------- | ---------- | ----------------- | ---------------------------------------------------------------------------------- |
| Primary      | `--accent-ctrl` | `#fff`     | none              | Hover: `--accent-ctrl-strong`; Active: `#1F5475` + `translateY(1px)`               |
| Secondary    | transparent     | `--text`   | `--border-strong` | Hover: `--surface-2` bg + `--accent-ctrl` border                                   |
| Ghost        | transparent     | `--text-2` | none              | Hover: `--surface-2` bg + `--text` color                                           |
| Danger       | `--error`       | `#fff`     | none              | Hover: `#d93a3a`                                                                   |
| Danger Ghost | transparent     | `--error`  | none              | Hover: `rgba(239,68,68,0.12)` bg                                                   |
| FAB          | `--accent-ctrl` | `#fff`     | none              | `56×56px`, `border-radius: --radius-lg`, shadow: `0 6px 18px rgba(42,107,145,.35)` |

**Sizes:**

- Default: `min-height: 44px`, `padding: 10px 20px`
- Small (`--sm`): `min-height: 32px`, `padding: 6px 12px`, `font-size: 12px`
- FAB large: `56×56px` — mandatory for score controls

**Disabled state (all variants):** `opacity: 0.4`, `cursor: not-allowed`, no shadow, no transform.

---

### IconButton

Square button containing only an icon. Used in nav bars, song card actions, table actions.

| Size    | Box                                     | Usage                                    |
| ------- | --------------------------------------- | ---------------------------------------- |
| Default | `44×44px`, `border-radius: --radius-md` | TopBar back/settings, song card favorite |
| Small   | `32×32px`, `border-radius: --radius-md` | Table row actions, dense layouts         |

- Background: `transparent`, border: `1px solid transparent`
- Color: `--text` (default), `--text-2` (subdued)
- Hover: `background: --surface-2`
- Focus: `outline: 2px solid --accent-ctrl`, `outline-offset: 2px`
- Disabled: `opacity: 0.4`, `cursor: not-allowed`

**Touch target:** When the visual size is 44px, no extension is needed (already meets WCAG). For 32px (small), add invisible padding to reach 44px hit area when on touch devices.

---

### Inputs

Base structure: label → wrapper (`--bg` background, `--border-strong` border, `--radius-md`) → icon + `<input>`.

| State   | Border            | Shadow                           |
| ------- | ----------------- | -------------------------------- |
| Default | `--border-strong` | none                             |
| Hover   | `--text-3`        | none                             |
| Focus   | `--accent-ctrl`   | `0 0 0 3px --accent-ctrl-soft`   |
| Error   | `--error`         | `0 0 0 3px rgba(239,68,68,0.18)` |

- Input `min-height: 48px`. Compact variant: `38px`.
- Input text: `font: 400 15px var(--font-ui)`, `color: --text`.
- Placeholder: `color: --text-3`.
- Textarea: `font: 400 13px var(--font-mono)`, `line-height: 1.7`, resizable vertically.
- Password eye toggle: `32px` icon button on right edge.
- Search: left icon + right `kbd` shortcut hint.

---

### Selection Controls

**Checkbox**

- Custom box: `18×18px`, `border-radius: 4px`, `border: 1.5px solid --border-strong`, `background: --bg`
- Checked: `background: --accent-ctrl`, `border-color: --accent-ctrl`, white checkmark via CSS

**Toggle (Switch)**

- Track: `40×22px`, `border-radius: 999px`, `background: --surface-2`, `border: 1px solid --border-strong`
- Thumb: `16×16px`, `background: --text-2`; checked → thumb slides right, track fills `--accent-ctrl`, thumb turns white

**Segmented Control**

- Container: `background: --surface-2`, `border: 1px solid --border`, `padding: 3px`
- Button default: `color: --text-2`, transparent bg
- Button active: `background: --accent-ctrl`, `color: #fff`
- Sizes: default `padding: 8px 14px`, small `6px 12px`

All controls: disabled state → `opacity: 0.4`, `cursor: not-allowed`.

---

### Badges & Tags

Base badge: `display: inline-flex`, `padding: 4px 10px`, `font: 500 12px --font-ui`, `border-radius: 999px`, `border: 1px solid --border-strong`, `background: --surface-2`.

| Variant           | Color            | Border                                       | Background                                                    |
| ----------------- | ---------------- | -------------------------------------------- | ------------------------------------------------------------- |
| Default           | `--text`         | `--border-strong`                            | `--surface-2`                                                 |
| Draft             | `--text-3`       | default                                      | default                                                       |
| Pending           | `--warning`      | `rgba(245,158,11,0.3)`                       | `rgba(245,158,11,0.08)`                                       |
| Published         | `--success`      | `rgba(16,185,129,0.3)`                       | `rgba(16,185,129,0.08)`                                       |
| Rejected          | `--error`        | `rgba(239,68,68,0.3)`                        | `rgba(239,68,68,0.08)`                                        |
| Instrument        | `--accent-chord` | `color-mix(--accent-chord 40%, transparent)` | `--accent-chord-soft`                                         |
| Type (Chords/Tab) | `--text-2`       | default                                      | `--surface-2` — monospace, uppercase, `letter-spacing: .08em` |

**Difficulty badge:** uses 3 vertical bars (`4×10px`, `border-radius: 1px`) colored by level:

- Beginner: bar 1 = `--success`
- Intermediate: bars 1–2 = `--warning`
- Advanced: all 3 = `--error`

---

### Filter Chips

Pill-shaped controls for filtering catalog results. Stateful: each chip is independently toggleable.

| State          | Background           | Border                     | Color                  |
| -------------- | -------------------- | -------------------------- | ---------------------- |
| Default        | `--surface-2`        | `--border-strong`          | `--text`               |
| Hover          | `--surface-2`        | `--accent-ctrl`            | `--text`               |
| Selected       | `--accent-ctrl-soft` | `--accent-ctrl`            | `--accent-ctrl-strong` |
| Add (`--plus`) | transparent          | `--border-strong` (dashed) | `--text-2`             |

- Base: `padding: 6px 12px`, `border-radius: 999px`, `font: 500 13px --font-ui`, `transition: --t-base`
- Selected variant adds optional `×` close icon on the right (margin-left: 4px) to remove the filter
- Container (`.ds-filters`): `display: flex`, `flex-wrap: wrap`, `gap: 8px`, `align-items: center`
- "Clear all" action chip aligns to the end with `margin-left: auto`

---

## 10. Components — Molecules

### ChordBlock

The core score rendering unit. Each chord+syllable pair is a column flex container:

```
┌──────────┐
│  Am      │  ← cp-chord: font-mono 700, --accent-chord, font-size ~0.75em
│  Flaca   │  ← cp-syll: font-mono, --text, white-space: pre
└──────────┘
```

- Container (`.cp-pair`): `display: inline-flex`, `flex-direction: column`, `align-items: flex-start`, `vertical-align: bottom`
- Chord: `font: 700 var(--font-mono)`, `color: --accent-chord`, `line-height: 1`, `margin-bottom: 2px`
- Syllable: `white-space: pre` — critical for alignment
- Chord row (`chord-line`): `display: flex`, `flex-wrap: wrap`, `align-items: flex-end`
- Score container: `line-height: 2.5–2.8`, `font-size: 16–18px`

**Light mode variant:** chord color `#0D6464`, syllable `#0F172A`.

---

### TranspositionStepper

Three-part control: `[-]` · `[ G ]` · `[+]`.

Container: `display: inline-flex`, `align-items: center`, `gap: 4px`, `padding: 4px`, `background: --surface-2`, `border: 1px solid --border`, `border-radius: 999px`.

| Size    | Button size | Key display      | Font |
| ------- | ----------- | ---------------- | ---- |
| Small   | `32×32px`   | `36px min-width` | 13px |
| Default | `40×40px`   | `48px min-width` | 16px |
| Large   | `56×56px`   | `72px min-width` | 20px |

- Button hover: `background: --accent-ctrl-soft`, `color: --accent-ctrl-strong`
- Key text: `font: 700 var(--font-mono)`, `color: --accent-chord`
- **Use Large size inside BottomActionBar** (meets 56px touch target rule)

---

### StarRating

**Single component** that handles both display and interaction (a non-interactive prop disables hover/click). Decision: simplicity over duplication.

```
★ ★ ★ ★ ☆   ← 4/5
```

- Container (`.stars`): `display: inline-flex`, `gap: 4px`
- Star button: `28×28px`, transparent background, no border, `cursor: pointer`
- Star glyph: rendered via `::before { content: '★'; font-size: 22px }`
- Empty: `color: --border-strong`
- Filled: `color: --warning`
- Filled state driven by `data-value` attribute on the container (e.g. `data-value="4"`) — CSS selectors fill stars 1..N

**Behavior:**

- Hover (interactive mode only): preview rating by updating `data-value` to hovered star index; restore previous value on `mouseleave`
- Click: commit new rating, persist via `data-value` and call onRate handler
- `readOnly` prop: disables pointer events and hover preview, used in SongCard for displaying average

**Touch:** Wrap each star in a 44×44px hit area (invisible padding) for mobile.

---

### SongCard

Song list item for the catalog.

```
┌───────────────────────────────────┬──────────────┐
│ Song Title (H2, 16px, 600)        │ ★ 4.2 (12)  │
│ Artist name (13px, --text-2)      │ [♡]          │
│ [Instrument badge] [Diff badge]   │              │
└───────────────────────────────────┴──────────────┘
```

- Layout: `grid-template-columns: 1fr auto`
- Background: `--surface-2`, border: `--border`, `border-radius: --radius-md`
- Hover: `border-color: --border-strong`, `translateY(-1px)`, `box-shadow: --shadow-1`
- Favorite button: `36×36px`, `border-radius: --radius-md`; active/hover: `color: --error`, `border-color: rgba(239,68,68,0.4)`
- Rating: `font: 700 13px --font-mono`, `color: --warning`

---

### EmptyState

Used when search returns no results or user has no saved tabs.

- Layout: `flex-direction: column`, `align-items: center`, `text-align: center`, `gap: 10px`
- Background: `--surface-2`, `border: 1px dashed --border-strong`, `border-radius: --radius-md`
- Illustration: SVG art, `color: --text-3`, `120×80px`
- Title: `14px`, `600`
- Subtitle: `13px`, `color: --text-2`, `max-width: 32ch`

---

## 11. Components — Organisms

### GlobalTopNav

The application shell navigation. Present on **all** authenticated and public pages (not on the score view, which uses `ScoreTopBar`).

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🎸 TabSpot   |  Catalog · Create · My Tabs   |   [🌓] [👤 User ▾]  │
└──────────────────────────────────────────────────────────────────────┘
```

**Structure** (3-column sticky grid):

- Container: `position: sticky`, `top: 0`, `z-index: 50`, `padding: 14px 32px`
- Background: `color-mix(in oklab, var(--bg) 80%, transparent)` + `backdrop-filter: blur(10px)`
- Border: `border-bottom: 1px solid --border`
- Grid: `grid-template-columns: auto 1fr auto`, `gap: --space-3`, `align-items: center`

**Slots:**
| Slot | Content |
|---|---|
| Left (brand) | Logo (28×28px, color `--text`) + product name (15px, 700) + optional tagline (11px, `--font-mono`, `--text-2`) |
| Center (nav) | Horizontal links — `padding: 8px 12px`, `font-size: 13px`, `color: --text-2`, `border-radius: --radius-sm`. Hover: `color: --text`, `background: --surface`. Active route: `color: --text` |
| Right (actions) | Theme toggle button (dropdown — see below) + User dropdown (profile/logout) **OR** "Login" / "Register" buttons when unauthenticated |

**Right-side action buttons:**

- Theme dropdown: IconButton (44×44) with current theme glyph (sun/moon/auto). On click → opens dropdown with options `Light · Dark · System` (Radix Dropdown Menu). Active option marked.
- User dropdown (logged in): Avatar/initials + chevron. On click → menu with `My Tabs · Settings · Logout`.
- Auth state (logged out): Two buttons — `Button / Ghost` "Login" + `Button / Primary` "Sign up".

**Mobile (≤ 960px):**

- Hide center nav links
- Brand collapses to logo only
- Right-side buttons remain
- Center nav moves to a hamburger menu (sheet/drawer) — to be detailed when implementing

> **Status:** Final shape (link list, exact actions) to be locked when navbar is implemented. The structure above is the canonical scaffold.

---

### ScoreTopBar

Header for the score reading view (replaces `GlobalTopNav` on `/[artist]/[song]` routes). Minimal, focused on the song.

```
[ ← ]    Song Title / Artist    [ ⚙ ]
```

- Grid: `grid-template-columns: 44px 1fr 44px`, `gap: 12px`, `padding: 12px 16px`
- Background: `--surface-2`, `border: 1px solid --border`, `border-radius: --radius-md` (when not stuck) or transparent + `border-bottom` when sticky
- Title: centered, `strong` for song name (16px, 600), `span` for artist (12px, `--text-2`)
- Icon buttons: `44×44px` IconButton (back, settings)

---

### BottomActionBar

The most critical component for live score use. Fixed to bottom, glassmorphism background.

```
┌────────────────────────────────────────────────────┐
│  [-] G [+]    ·    Scroll 1.2×    |  [▶ Play]     │
└────────────────────────────────────────────────────┘
```

- Position: `fixed bottom-0`, `left: 12px`, `right: 12px`, `bottom: 12px`
- Container: glassmorphism effect (see [Effects](#7-effects)), `border-radius: --radius-2xl`, `padding: 6px 6px 6px 10px`
- Left: `TranspositionStepper` (large size) + optional scroll speed control
- Right: `FAB` (56×56px, `--accent-ctrl`)
- **No Tailwind classes** — implement via CSS Module using the token values above

---

### Modal / Dialog

Implemented via **Radix UI `@radix-ui/react-dialog`** — provides accessible overlay, focus trap, and `Escape` close behavior. Apply custom styles via CSS Modules.

- Overlay: dark scrim over page content
- Surface: `background: --surface`, `border: 1px solid --border-strong`, `border-radius: --radius-lg`, `padding: 24px`, `box-shadow: --shadow-2`, `max-width: 380px`
- Title: 17px, 700
- Body: 13px, `color: --text-2`
- Actions: right-aligned flex, gap 8px — typically Ghost cancel + Primary confirm (or Danger for destructive)

---

### AuthForm

Centered card containing login/register flow.

- Outer card: `background: --surface`, `border: 1px solid --border`, `border-radius: --radius-lg`
- Stack: `h4` (20px, 700) → `p` subtitle → inputs → divider → `Button / Primary`
- Divider ("or"): centered text with `::before`/`::after` lines, `color: --text-3`, `background: --border-strong`
- Inputs: full-width, standard Input component

---

### AdminTable

Used in the admin panel (user management, content moderation). **Implemented with `@tanstack/react-table`** for sorting, filtering, pagination, and column resizing — Radix or custom UI on top.

**Visual styling (CSS Module):**

```
┌──────────────────────────────────────────────────────────┐
│ TITLE            ARTIST       STATUS    UPDATED   ACTIONS│  ← header
├──────────────────────────────────────────────────────────┤
│ Flaca            Calamaro     [pending] 2d ago    ⋮  ▶ ✓ │  ← row
│ De Música...     Soda Stereo  [✓ pub.]  1w ago    ⋮  ▶ ✓ │
└──────────────────────────────────────────────────────────┘
```

- Width: `100%`, `border-collapse: separate`, `border-spacing: 0`, `font-size: 13px`
- Cells (`th`, `td`): `padding: 12px 14px`, `text-align: left`, `border-bottom: 1px solid --border`
- Header row (`th`): `font: 500 11px --font-mono`, `text-transform: uppercase`, `letter-spacing: 0.06em`, `color: --text-2`, `background: --surface-2`
- First/last `th`: `border-top-left-radius` / `border-top-right-radius: --radius-md`
- Row hover: `background: --surface-2`
- Actions column: right-aligned flex of small IconButtons, `gap: 6px`
- Status cells: use `Badge` component (Pending/Published/Rejected)

**Tanstack-specific:**

- Use `flexRender()` for cell content
- Sort indicators: small caret icon next to header label, color `--text-3` (inactive) / `--accent-chord` (active)
- Pagination: Footer row with page size select + page navigation IconButtons
- Empty state: Use `EmptyState` molecule when `table.getRowModel().rows.length === 0`

---

## 12. Score Renderer

The ChordPro renderer is the heart of the product. Implementation rules:

| Rule                     | Value                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Font                     | `--font-mono` — mandatory, non-negotiable                                                                                                                                |
| Font size                | 16px (default view), 18px (large)                                                                                                                                        |
| Line height              | `2.6` — space for chord above lyric                                                                                                                                      |
| Container padding        | `32px 24px` lateral, `72px` bottom (BottomActionBar clearance)                                                                                                           |
| Tab blocks               | `white-space: pre`, `font: 400 13px --font-mono`, `line-height: 1.7`, `background: --bg`, `border: 1px solid --border`, `border-radius: --radius-sm`, `overflow-x: auto` |
| Section headers          | `font: 500 11px --font-mono`, `text-transform: uppercase`, `letter-spacing: .08em`, `color: --text-2`                                                                    |
| Song meta (title/artist) | Displayed before score content, separated by `border-bottom: 1px solid --border`                                                                                         |
| Fade overlays            | Top and bottom gradient fades (see [Effects](#7-effects))                                                                                                                |

**ChordPro input textarea** (in editor view):

- `font: 400 13px --font-mono`, `line-height: 1.8`, `color: --text`
- Background: `--surface-2`, no border, full pane height
- Split view: code pane left (35%), render pane right (65%)

### Reference algorithms (`tab-spot-design/ds.js`)

The original design demo includes working reference implementations. These will be ported to TypeScript in Fase 7 (with Vitest tests):

- **Transposition** — `transposeChord(chord, semis)` handles:
  - Chord regex: `/^([A-G])(b|#)?(.*)$/`
  - Sharp / flat note arrays (12 each)
  - Slash chords (`D/F#`) — transposes both root and bass independently
  - Modulo wrap: `((idx + semis) % 12 + 12) % 12`
- **Parser** — `parseChordPro(src, semis)` handles:
  - Directives: `{title}`, `{artist}`, `{key}`, `{soc}` / `{start_of_chorus}`, `{sov}`, `{comment}` / `{c}`
  - Tab blocks: `{start_of_tab}` / `{sot}` … `{end_of_tab}` / `{eot}` — preserved as `<pre>` with `white-space: pre`
  - Chord tokens: `[Em]`, `[D7]`, `[G/B]` — extracted via `/\[([^\]]+)\]/g`
  - Chord-syllable pairing: each chord binds to text until next chord
  - HTML escape on output (XSS-safe)

> **Do not reimplement these from scratch in Fase 3.** They are product logic, not design system. The DS only mandates the markup shape (`.cp-pair`, `.cp-chord`, `.cp-syll`, `.cp-tabblock`, `.cp-h`, `.cp-meta`) and the CSS to render it.

---

## 13. Page Layout

Top-level layout patterns shared across pages.

### Container width

| Context           | `max-width`        | `padding-x`                                  |
| ----------------- | ------------------ | -------------------------------------------- |
| Page main content | `1280px`           | `32px` (≥960px), `16px` (<960px)             |
| Score view        | `100%` (no max)    | `16px` lateral on score pane, `24px` on rest |
| Auth views        | `400px` (centered) | `16px`                                       |

### Section spacing

```css
.section {
  padding: 72px 0 16px;
  border-top: 1px dashed var(--border);
}
.section:first-of-type {
  border-top: 0;
  padding-top: 56px;
}
```

Section header structure:

- Numbered marker: `font: 700 46px --font-mono`, `color: --accent-chord`, large left-side numeral
- Title: `h2`, `font-size: 32px`, `letter-spacing: -0.02em`
- Subtitle: `color: --text-2`, immediately below title

### Responsive breakpoint

Single breakpoint at **`960px`**:

- Above: multi-column grids, navigation expanded, page padding 32px
- Below: stacked single-column, hamburger nav, page padding 16px

> No tablet-specific intermediate breakpoint at MVP — single mobile/desktop split.

---

## 14. Implementation Rules

### CSS Custom Properties structure

Tokens live in `app/globals.css` (or `src/styles/globals.css` after the `src/` migration):

```css
:root {
  /* ... all dark-mode tokens (default) ... */
}

[data-theme='light'] {
  /* ... light-mode overrides only ... */
}
```

### Theme strategy (next-themes)

```tsx
<ThemeProvider
  attribute="data-theme"     // matches [data-theme="light"] selectors
  defaultTheme="dark"        // fallback when no system preference detectable
  enableSystem={true}        // respect prefers-color-scheme
  disableTransitionOnChange  // avoid flash during theme switch
>
```

**Rules:**

- `attribute="data-theme"` is mandatory — the CSS targets `[data-theme="light"]`, not `.light` class.
- `enableSystem={true}` makes the app follow the user's OS preference on first load.
- `defaultTheme="dark"` is the fallback when `prefers-color-scheme` is unavailable — never default to light.
- Theme is exposed in two places (G5):
  1. **GlobalTopNav dropdown** — quick switch, options `Light · Dark · System`.
  2. **Settings page** — same control, persisted via next-themes `localStorage`.

### Geist font replacement

Current `app/layout.tsx` (boilerplate) uses Geist + Geist Mono. **Replace entirely:**

- Remove the `Geist` and `Geist_Mono` imports
- Remove the related className references on `<html>` / `<body>`
- Replace with `Inter` + `JetBrains_Mono` from `next/font/google` exposing `--font-ui` and `--font-mono` variables (see [Typography](#3-typography) for the pattern)

### Token consumption in CSS Modules

```css
/* ✅ Correct — semantic token */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
}

/* ❌ Wrong — hardcoded value */
.card {
  background: #1a1d21;
}
```

Always use `var(--token)` — never raw hex values in module files. Raw values only live in `globals.css`.

### Radix UI integration

Radix provides behavior (accessibility, keyboard nav, focus management). **Do not use Radix's built-in styles.** Style exclusively via CSS Modules using the tokens above.

Planned primitives for initial layout:

- `@radix-ui/react-dialog` — Modal / Dialog
- `@radix-ui/react-dropdown-menu` — Contextual menus
- Install additional primitives only as needed

### Component file naming

Follow Atomic Design levels when placing components:

```
src/components/ui/          ← Atoms (Button, Input, Badge, Toggle)
src/features/tabs/          ← Molecules/Organisms specific to score (ChordBlock, TranspositionStepper)
src/components/             ← Shared organisms (TopBar, BottomActionBar, Modal)
```

### Score rendering priority

The ChordPro parser and chord transposition algorithm are **load-bearing features** — they must have Vitest tests as soon as the testing setup lands (Fase 7). No other component has this requirement at MVP.

### What does NOT exist yet (do not implement ahead of schedule)

- `src/` directory structure (Fase 4)
- Zustand store (Fase 5)
- React Query provider (Fase 5)
- Supabase client (Fase 5)
- react-hook-form (Fase 6)
- Vitest (Fase 7)
