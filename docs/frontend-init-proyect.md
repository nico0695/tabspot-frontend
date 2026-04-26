# Roadmap de Configuración del Proyecto

## Fase 1: Cimientos del Proyecto (Framework y Entorno)
El objetivo aquí es levantar el proyecto base y asegurar que las importaciones y variables de entorno estén sólidas desde el inicio.

* [ ] **1. Inicializar Next.js:** Ejecutar `npx create-next-app@latest`. Asegurarte de seleccionar TypeScript, App Router y decirle que **NO** a Tailwind CSS.
* [ ] **2. Limpiar Boilerplate:** Eliminar el CSS por defecto y limpiar el `app/page.tsx` y `app/layout.tsx`.
* [ ] **3. Absolute Imports:** Verificar en `tsconfig.json` que los paths estén configurados (`"@/*": ["./src/*"]`) para usar rutas limpias.
* [ ] **4. Validación de Entorno:** Instalar y configurar `@t3-oss/env-nextjs` con **Zod**. Crear tu archivo `env.ts` para definir qué variables son obligatorias (ej. las de Supabase) para que el proyecto no compile si faltan.

---

## Fase 2: Calidad de Código (QA Automático)
No escribas código de negocio sin antes asegurar que el linter te cuide las espaldas.

* [ ] **1. Linter y Formatter:** Instalar **Prettier** y los plugins para integrarlo con ESLint (`eslint-config-prettier`, `eslint-plugin-prettier`).
* [ ] **2. Reglas Estrictas:** Configurar el `.eslintrc.json` y el `.prettierrc` (define comillas simples, anchos de línea, etc.).
* [ ] **3. Git Hooks:** Instalar e inicializar **Husky**.
* [ ] **4. Linting Pre-commit:** Instalar `lint-staged` y configurarlo en el `package.json` para que ESLint y Prettier solo analicen los archivos que estás a punto de commitear.

---

## Fase 3: Estilos y Sistema Visual
Preparar el terreno para tu diseño "Stage Focus" (Dark-First) con CSS Modules y Radix.

* [ ] **1. Sistema de Temas:** Instalar `next-themes`. Envolver tu `app/layout.tsx` con su Provider para forzar el modo oscuro por defecto y evitar parpadeos (FOUC).
* [ ] **2. Variables CSS:** En tu `globals.css`, definir tus Design Tokens básicos como variables CSS nativas (los grises oscuros, el cyan eléctrico, la tipografía monoespaciada).
* [ ] **3. Radix UI (Base):** Instalar las primeras primitivas que sepas que vas a usar en el layout base (ej. `@radix-ui/react-dialog` para modales, o `@radix-ui/react-dropdown-menu`).

---

## Fase 4: Arquitectura de Carpetas (Feature-Sliced Design)
Crear el esqueleto físico del proyecto. Solo crear las carpetas, aún sin lógica.

* [ ] **1. Estructura Base:** Crear dentro de `src/` las carpetas: `components/`, `features/`, `lib/`, `store/`, `styles/`.
* [ ] **2. Dominios de Negocio:** Dentro de `features/`, crear las carpetas para tus módulos principales: `tabs/`, `catalog/`, `auth/`.
* [ ] **3. UI Base:** Dentro de `components/`, crear una subcarpeta `ui/` (aquí vivirán tus botones e inputs genéricos hechos con CSS Modules).

---

## Fase 5: Estado y Fetching (El Motor de Datos)
Instalar las herramientas que manejarán la lógica y comunicación de la app.

* [ ] **1. Estado Global:** Instalar **Zustand**. Crear un archivo `src/store/useUIStore.ts` muy básico (ej. solo para manejar un estado de `isMenuOpen` o el theme de la partitura).
* [ ] **2. React Query:** Instalar `@tanstack/react-query` y `@tanstack/react-query-devtools`. Crear un Provider global y envolver la app en el `layout.tsx`.
* [ ] **3. Supabase Client:** Instalar `@supabase/supabase-js`. Crear el cliente reutilizable en `src/lib/supabase.ts` consumiendo las variables de entorno validadas en la Fase 1.

---

## Fase 6: Formularios y Utilidades
Preparar las herramientas para la creación de tablaturas.

* [ ] **1. Manejo de Formularios:** Instalar `react-hook-form` y `@hookform/resolvers`.
* [ ] **2. Validación de Esquemas:** Asegurar que **Zod** está instalado (probablemente lo instalaste en la Fase 1 con las variables de entorno).
* [ ] **3. Fechas:** Instalar `date-fns` para cuando necesites formatear las fechas de las publicaciones.

---

## Fase 7: Entorno de Pruebas (Vital para tu Parser)
Tu función que lee ChordPro será el corazón de la app; necesita tests desde el día 1.

* [ ] **1. Framework de Testing:** Instalar **Vitest**, `@testing-library/react`, `@testing-library/dom` y `@vitejs/plugin-react`.
* [ ] **2. Configuración:** Crear el archivo `vitest.config.ts` y configurar el entorno simulado del DOM (`jsdom` o `happy-dom`).
* [ ] **3. Prueba de Humo:** Crear un test básico `App.test.tsx` simplemente para verificar que Vitest corre correctamente al ejecutar `npm run test`.