'use client';

import { useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import type { ButtonVariant } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import styles from './page.module.css';

const subscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function GearIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function HomeDemo() {
  const [modalOpen, setModalOpen] = useState(false);

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

      <section aria-labelledby="icon-buttons-h" className={styles.section}>
        <h2 id="icon-buttons-h" className={styles.sectionHeading}>
          Icon Buttons
        </h2>
        <div className={styles.componentRow}>
          <IconButton label="Settings" size="md">
            <GearIcon />
          </IconButton>
          <IconButton label="Settings" size="sm">
            <GearIcon />
          </IconButton>
          <IconButton label="Settings" size="md" disabled>
            <GearIcon />
          </IconButton>
        </div>
      </section>

      <section aria-labelledby="inputs-h" className={styles.section}>
        <h2 id="inputs-h" className={styles.sectionHeading}>
          Inputs
        </h2>
        <div className={styles.inputGrid}>
          <Input variant="text" label="Email" placeholder="you@example.com" />
          <Input variant="password" label="Password" placeholder="Enter password" />
          <Input variant="search" placeholder="Search tabs..." />
          <Input variant="text" label="Compact" size="compact" placeholder="Compact input" />
          <Input
            variant="text"
            label="With error"
            error="This field is required"
            placeholder="..."
          />
          <Input
            variant="text"
            label="With hint"
            hint="We'll never share your email"
            placeholder="..."
          />
          <Input variant="text" label="Disabled" placeholder="Can't edit" disabled />
        </div>
      </section>

      <section aria-labelledby="form-controls-h" className={styles.section}>
        <h2 id="form-controls-h" className={styles.sectionHeading}>
          Form Controls
        </h2>
        <div className={styles.formControlsGrid}>
          <div>
            <h3 className={styles.subsectionLabel}>Toggle</h3>
            <div className={styles.controlStack}>
              <Toggle label="Auto-scroll" defaultChecked />
              <Toggle label="Dark mode" />
              <Toggle label="Disabled" disabled />
            </div>
          </div>
          <div>
            <h3 className={styles.subsectionLabel}>Checkbox</h3>
            <div className={styles.controlStack}>
              <Checkbox label="Remember me" defaultChecked />
              <Checkbox label="Accept terms" />
              <Checkbox label="Disabled" disabled />
            </div>
          </div>
          <div>
            <h3 className={styles.subsectionLabel}>Select</h3>
            <Select
              label="Instrument"
              placeholder="Choose..."
              options={[
                { value: 'guitar', label: 'Guitar' },
                { value: 'bass', label: 'Bass' },
                { value: 'ukulele', label: 'Ukulele' },
                { value: 'piano', label: 'Piano' },
              ]}
            />
            <div style={{ marginTop: 12 }}>
              <Select
                label="With error"
                placeholder="Required"
                error="Please select an instrument"
                options={[{ value: 'x', label: 'X' }]}
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="badges-h" className={styles.section}>
        <h2 id="badges-h" className={styles.sectionHeading}>
          Badges
        </h2>
        <div className={styles.componentRow}>
          <Badge>Default</Badge>
          <Badge variant="draft">Draft</Badge>
          <Badge variant="pending">Pending</Badge>
          <Badge variant="published">Published</Badge>
          <Badge variant="rejected">Rejected</Badge>
          <Badge variant="instrument">Guitar</Badge>
          <Badge variant="type">CHORDPRO</Badge>
        </div>

        <h2 id="chips-h" className={styles.sectionHeading} style={{ marginTop: 32 }}>
          Chips
        </h2>
        <div className={styles.componentRow}>
          <Chip onSelect={() => {}}>Rock</Chip>
          <Chip selected onSelect={() => {}}>
            Pop
          </Chip>
          <Chip onSelect={() => {}} onRemove={() => {}}>
            Jazz
          </Chip>
          <Chip disabled>Disabled</Chip>
        </div>
      </section>

      <section aria-labelledby="segmented-h" className={styles.section}>
        <h2 id="segmented-h" className={styles.sectionHeading}>
          Segmented Controls
        </h2>
        <div className={styles.controlStack}>
          <SegmentedControl
            options={[
              { value: 'all', label: 'All' },
              { value: 'mine', label: 'My Tabs' },
              { value: 'favorites', label: 'Favorites' },
            ]}
            defaultValue="all"
            shape="rounded"
          />
          <SegmentedControl
            options={[
              { value: 'guitar', label: 'Guitar' },
              { value: 'bass', label: 'Bass' },
              { value: 'uke', label: 'Ukulele' },
            ]}
            defaultValue="guitar"
            shape="pill"
            size="sm"
          />
        </div>
      </section>

      <section aria-labelledby="cards-h" className={styles.section}>
        <h2 id="cards-h" className={styles.sectionHeading}>
          Cards
        </h2>
        <div className={styles.cardGrid}>
          <Card>
            <Card.Header>
              <h3>Song Details</h3>
            </Card.Header>
            <Card.Description>ChordPro metadata and settings for this tab.</Card.Description>
            <Card.Body>
              <p style={{ color: 'var(--text-2)', fontSize: 'var(--fs-sm)' }}>
                Card body content goes here.
              </p>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header>
              <h3>Transpose</h3>
            </Card.Header>
            <Card.Description>Change the key of the current song.</Card.Description>
            <Card.Body>
              <p style={{ color: 'var(--text-2)', fontSize: 'var(--fs-sm)' }}>
                Transposition controls would go here.
              </p>
            </Card.Body>
          </Card>
        </div>

        <h2 id="empty-h" className={styles.sectionHeading} style={{ marginTop: 32 }}>
          Empty States
        </h2>
        <EmptyState
          title="No tabs found"
          description="Try a different search or add your first tab."
          action={
            <Button variant="primary" size="sm">
              Add Tab
            </Button>
          }
        />
      </section>

      <section aria-labelledby="modal-h" className={styles.section}>
        <h2 id="modal-h" className={styles.sectionHeading}>
          Modal
        </h2>
        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          Open Modal
        </Button>
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Delete Tab"
          description="Are you sure you want to delete this tab? This action cannot be undone."
          actions={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setModalOpen(false)}>
                Delete
              </Button>
            </>
          }
        >
          <p style={{ color: 'var(--text-2)', fontSize: 'var(--fs-sm)' }}>
            &quot;De M&uacute;sica Ligera&quot; by Soda Stereo will be permanently removed from your
            library.
          </p>
        </Modal>
      </section>
    </main>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <SegmentedControl
      options={[
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' },
      ]}
      value={theme}
      onChange={setTheme}
      shape="pill"
      size="sm"
    />
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
