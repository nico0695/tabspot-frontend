# Module Decomposition Conventions

Standards for organizing feature modules in the TabSpot frontend. These rules apply to all admin modules and should be followed when creating new ones.

## File naming convention

All module files (except `index.ts`) use the pattern `{module}.{concern}.ts`:

```
artists.types.ts
artists.api.ts
artists.hooks.ts
artists.constants.ts
```

The module name is **plural** and matches the containing directory name. This makes files identifiable in editor tabs and global searches without needing the folder path for context.

`index.ts` (barrel export) is the only exception — it keeps its standard name.

## File structure per route module

Each route module in `src/app/admin/{module}/` should follow this structure:

```
src/app/admin/{module}/
  page.tsx                        # Route page (only imports, state, JSX)
  page.module.css                 # Page styles
  {module}.constants.ts           # Static constants for the module (when 2+ exist)
  components/                     # Non-page components used by this route
    MyComponent.tsx
    MyComponent.module.css
```

## Rule 1: Constants — extract to `{module}.constants.ts`

**Trigger:** 2 or more static `const` declarations at module level in a component file.

**Action:** Extract to `{module}.constants.ts` co-located in the same route directory.

**Exception:** A single constant may stay inline. Extract it when a second constant appears.

**Why `app/` and not `features/`:** Constants like `MODAL_TITLES` or `FORM_FIELDS` are UI-layer concerns. Domain constants (if any) belong in `src/features/admin/{module}/`.

## Rule 2: Exported types — move to `{module}.types.ts`

**Trigger:** A type alias or interface is exported from a component file and imported by other files.

**Action:** Move to `src/features/admin/{module}/{module}.types.ts`. The barrel export (`index.ts`) re-exports everything automatically.

**Exception:** Component props interfaces that are NOT exported stay co-located with the component. They are part of the component's implementation, not the module's public contract.

## Rule 3: Pure functions — extract to `{module}.utils.ts`

**Trigger:** Any pure function that does not depend on React or component state.

**Action:**

- **Cross-module functions** (e.g., `formatDate()`) → shared utility in `src/lib/` (e.g., `src/lib/format.ts`).
- **Module-specific functions** (e.g., `cleanSongData()`) → `src/features/admin/{module}/{module}.utils.ts`.

**Exception:** Functions that return JSX (render helpers like `roleBadge()`) are closer to sub-components than pure utilities. Treat them per Rule 4.

## Rule 4: Components — move to `components/`

**Trigger:** Any non-page React component file in a route directory.

**Action:** Move to `src/app/admin/{module}/components/`. Include its CSS Module file.

**Why:** Route directories should contain only the page entry point, its styles, and module-level config (constants). All other components belong in `components/` to keep the route directory clean and signal what is the page vs. supporting UI.

### Grouping into component folders

When `components/` contains 2 or more components, group each component into its own folder:

```
# Before (1 component — flat is fine)
components/
  SongFormModal.tsx
  SongFormModal.module.css

# After (2+ components — group into folders)
components/
  SongFormModal/
    SongFormModal.tsx
    SongFormModal.module.css
  SongLyricsPanel/
    SongLyricsPanel.tsx
    SongLyricsPanel.module.css
```

No `index.ts` barrel is required inside each component folder — import the component directly by name.

## Rule 5: Sub-components — inline threshold

Small, private sub-components (< ~50 lines, used only within one file) may stay inline in the parent component file.

Extract to its own file in `components/` when:

- Used by multiple files, OR
- Exceeds ~50 lines, OR
- Has its own significant styling

## Reference: `features/` structure

Each feature module in `src/features/admin/{module}/` follows:

```
src/features/admin/{module}/
  {module}.types.ts      # Domain types + exported UI types
  {module}.api.ts        # API layer (fetch functions)
  {module}.hooks.ts      # React Query hooks
  {module}.schema.ts     # Zod validation schemas
  {module}.columns.tsx   # DataTable column definitions
  {module}.utils.ts      # Module-specific pure functions (when needed)
  index.ts               # Barrel export (always index.ts)
```
