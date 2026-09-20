'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IMPORT_STEPS } from '@/features/admin/import/import.constants';
import type { ImportStep } from '@/features/admin/import/import.types';
import { useImportWizardStore } from '@/features/admin/import/import.store';
import { ArtistScopeStep } from './components/ArtistScopeStep';
import { IntakeStep } from './components/IntakeStep';
import { ReviewStep } from './components/ReviewStep';
import { SendStep } from './components/SendStep';
import styles from './page.module.css';

const STEP_LABELS: Record<ImportStep, string> = {
  artist: 'Artista',
  intake: 'Archivos',
  review: 'Revisión',
  send: 'Envío',
};

function StepPlaceholder({ step }: { step: ImportStep }) {
  const index = IMPORT_STEPS.indexOf(step) + 1;
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderTitle}>
        Paso {index} — {STEP_LABELS[step]}
      </p>
      <p className={styles.placeholderNote}>próximamente</p>
    </div>
  );
}

export default function AdminImportPage() {
  const step = useImportWizardStore((s) => s.step);
  const setStep = useImportWizardStore((s) => s.setStep);
  // Subscribed separately so the stepper re-renders reactively when gates change.
  const artist = useImportWizardStore((s) => s.artist);
  const rawFilesCount = useImportWizardStore((s) => s.rawFiles.length);
  const readyCount = useImportWizardStore((s) => s.summary.ready);

  const currentIndex = IMPORT_STEPS.indexOf(step);
  const prevStep = currentIndex > 0 ? IMPORT_STEPS[currentIndex - 1] : null;
  const nextStep = currentIndex < IMPORT_STEPS.length - 1 ? IMPORT_STEPS[currentIndex + 1] : null;

  // Mirrors store gating for reactive stepper updates; setStep remains the guard.
  const canReachStep = (target: ImportStep) => {
    const toIdx = IMPORT_STEPS.indexOf(target);
    if (toIdx <= currentIndex) return true;
    for (let i = currentIndex + 1; i <= toIdx; i += 1) {
      const gate = IMPORT_STEPS[i];
      if (gate === 'intake' && !artist) return false;
      if (gate === 'review' && rawFilesCount === 0) return false;
      if (gate === 'send' && readyCount === 0) return false;
    }
    return true;
  };

  const nextDisabled = !nextStep || !canReachStep(nextStep);
  const backDisabled = !prevStep;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Importar</h1>
      </header>

      <nav className={styles.stepper} aria-label="Pasos de importación">
        {IMPORT_STEPS.map((s, i) => {
          const isActive = s === step;
          const isDone = i < currentIndex;
          const isBlocked = !isActive && !isDone && !canReachStep(s);
          const cls = isActive
            ? styles.stepActive
            : isDone
              ? styles.stepDone
              : isBlocked
                ? styles.stepBlocked
                : styles.step;
          return (
            <button
              key={s}
              type="button"
              className={cls}
              aria-current={isActive ? 'step' : undefined}
              disabled={isBlocked}
              onClick={() => setStep(s)}
            >
              <span className={styles.stepIndex}>
                {isDone ? <Check size={14} aria-hidden /> : i + 1}
              </span>
              <span className={styles.stepLabel}>{STEP_LABELS[s]}</span>
            </button>
          );
        })}
      </nav>

      <section className={styles.stepBody}>
        {step === 'artist' ? (
          <ArtistScopeStep />
        ) : step === 'intake' ? (
          <IntakeStep />
        ) : step === 'review' ? (
          <ReviewStep />
        ) : step === 'send' ? (
          <SendStep />
        ) : (
          <StepPlaceholder step={step} />
        )}
      </section>

      <footer className={styles.footer}>
        <Button
          variant="secondary"
          className={styles.navButton}
          disabled={backDisabled}
          onClick={() => prevStep && setStep(prevStep)}
        >
          Atrás
        </Button>
        <Button
          variant="primary"
          className={styles.navButton}
          disabled={nextDisabled}
          onClick={() => nextStep && setStep(nextStep)}
        >
          Siguiente
        </Button>
      </footer>
    </div>
  );
}
