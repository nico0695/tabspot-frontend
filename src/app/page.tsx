'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import type { ButtonVariant } from '@/components/ui/Button';
import styles from './page.module.css';

const subscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export default function HomeDemo() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1>TabSpot — Design System Playground</h1>
          <p className={styles.tagline}>Stage Focus · Dark-first · CSS Modules + tokens</p>
        </div>
        <ThemeToggle />
      </header>

      <section aria-labelledby="typography-h" className={styles.section}>
        <h2 id="typography-h" className={styles.sectionHeading}>
          Typography
        </h2>
        <div className={styles.typoStack}>
          <h1>H1 — Page title (24/700)</h1>
          <h2>H2 — Section heading (18/600)</h2>
          <p>Body — 16/400 with line-height 1.5. The quick brown fox jumps over the lazy dog.</p>
          <small>Small / Metadata — 13/500</small>
          <pre className={styles.codeBlock}>
            <code>{`{title: De Música Ligera}\n[G]Ella du[D]rmió al ca[Em]lor de las [C]masas`}</code>
          </pre>
        </div>
      </section>

      <section aria-labelledby="palette-h" className={styles.section}>
        <h2 id="palette-h" className={styles.sectionHeading}>
          Palette
        </h2>
        <div className={styles.swatchGrid}>
          <Swatch token="--bg" label="bg" />
          <Swatch token="--surface" label="surface" />
          <Swatch token="--surface-2" label="surface-2" />
          <Swatch token="--text" label="text" />
          <Swatch token="--text-2" label="text-2" />
          <Swatch token="--text-3" label="text-3" />
          <Swatch token="--accent-chord" label="accent-chord" />
          <Swatch token="--accent-chord-soft" label="accent-chord-soft" />
          <Swatch token="--accent-ctrl" label="accent-ctrl" />
          <Swatch token="--accent-ctrl-strong" label="accent-ctrl-strong" />
          <Swatch token="--accent-ctrl-soft" label="accent-ctrl-soft" />
          <Swatch token="--success" label="success" />
          <Swatch token="--warning" label="warning" />
          <Swatch token="--error" label="error" />
        </div>
      </section>

      <section aria-labelledby="buttons-h" className={styles.section}>
        <h2 id="buttons-h" className={styles.sectionHeading}>
          Buttons
        </h2>
        <div className={styles.buttonGrid}>
          <ButtonRow label="Primary" variant="primary" />
          <ButtonRow label="Secondary" variant="secondary" />
          <ButtonRow label="Ghost" variant="ghost" />
          <ButtonRow label="Danger" variant="danger" />
          <ButtonRow label="Danger Ghost" variant="danger-ghost" />
        </div>
      </section>
    </main>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className={styles.themeToggle} role="group" aria-label="Theme">
      <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
        Light
      </button>
      <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
        Dark
      </button>
      <button type="button" aria-pressed={theme === 'system'} onClick={() => setTheme('system')}>
        System
      </button>
    </div>
  );
}

function Swatch({ token, label }: { token: string; label: string }) {
  return (
    <div className={styles.swatch}>
      <div className={styles.swatchChip} style={{ background: `var(${token})` }} />
      <div>
        <strong>{label}</strong>
        <code>{token}</code>
      </div>
    </div>
  );
}

function ButtonRow({ label, variant }: { label: string; variant: ButtonVariant }) {
  return (
    <div className={styles.btnRow}>
      <span className={styles.btnRowLabel}>{label}</span>
      <Button variant={variant} size="md">
        md
      </Button>
      <Button variant={variant} size="sm">
        sm
      </Button>
      <Button variant={variant} size="md" disabled>
        disabled
      </Button>
    </div>
  );
}
