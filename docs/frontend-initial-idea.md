# Relevamiento Frontend MVP - TabSpot

## Framework y Entorno

- **Core:** Next.js (App Router).
- **Lenguaje:** TypeScript (modo estricto).
- **Estrategias de Renderizado:** React Server Components (RSC) e Incremental Static Regeneration (ISR) para servir tablaturas con máxima velocidad y SEO.
- **Validación de Entorno:** `@t3-oss/env-nextjs` para garantizar la presencia de variables (ej. Supabase URL) durante el build.

---

## Librerías (Estrictamente Necesarias)

- **Manejo de Formularios:** React Hook Form.
- **Validación de Datos/Schemas:** Zod.
- **Data Fetching & Mutaciones (Cliente):** TanStack Query (React Query).
- **Manejo de Fechas:** `date-fns`.
- **Autenticación (Cliente):** Supabase JS SDK.
- **Theming:** `next-themes` (para control de modo oscuro/claro sin parpadeos FOUC).

---

## Estilos y UI (Arquitectura y Herramientas)

- **Motor CSS:** CSS Modules nativo de Next.js (`.module.css`) para evitar colisiones de clases y compilar a CSS estático.
- **Componentes UI (Base):** Radix UI Primitives (Componentes headless que resuelven accesibilidad, modales, tooltips sin inyectar estilos propios).
- **Tipografía Estructural:** Fuente **Monospace** obligatoria (ej. JetBrains Mono o Fira Code) para asegurar la alineación de acordes y texto en el renderizado de ChordPro.
- **Tipografía UI:** Fuente Sans-Serif limpia para navegación general.
- **Reglas Funcionales de Layout:**
  - **Touch Targets:** Áreas de interacción con un mínimo de **56x56px** para facilitar su uso durante la ejecución instrumental.
  - **Interlineado estricto:** Mínimo **250%** en las partituras para reservar espacio al acorde flotante.

---

## Store (Estado Global)

- **Gestor:** Zustand.
- **Uso principal:** Manejo de estados efímeros de la interfaz, preferencias de usuario en memoria, control de la transposición matemática activa y estado del auto-scroll.

---

## Arquitectura de Proyecto (Feature-Sliced Design)

Se implementará una adaptación de **Feature-Sliced Design (FSD)** para mantener la escalabilidad.

```
text
/src
  /app                  # Enrutador de Next.js (pages, layouts, error boundaries).
  /components           # Componentes UI globales (Radix base, CSS Modules).
  /features             # Lógica encapsulada por dominio:
    /tabs               # -> Parser ChordPro, controles de scroll, math.
    /auth               # -> Lógica local de sesión y Supabase.
    /catalog            # -> Listados, filtros de búsqueda.
  /lib                  # Configuraciones globales y clientes (Supabase, Fetchers).
  /store                # Archivos de Zustand.
  /styles               # Design tokens y resets globales.
```

## Calidad de Código y Testing (QA)

- **Linter & Formatter:** ESLint + Prettier configurados en conjunto.
- **Git Hooks:** Husky + lint-staged para ejecutar validaciones en pre-commit.
- **Framework de Testing:** Vitest + React Testing Library.
- **Cobertura Obligatoria:** Pruebas unitarias exhaustivas para la función del **Parser de ChordPro** y el **algoritmo de transposición de acordes**.
