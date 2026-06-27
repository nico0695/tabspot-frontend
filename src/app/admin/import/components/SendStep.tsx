'use client';

import { Button } from '@/components/ui/Button';
import { useImportWizardStore } from '@/features/admin/import/import.store';
import { selectReadyCount } from '@/features/admin/import/import.selectors';
import styles from './SendStep.module.css';

export function SendStep() {
  const readyCount = useImportWizardStore((s) => selectReadyCount(s.summary));

  return (
    <div className={styles.step}>
      <h2 className={styles.heading}>Envío</h2>
      <p className={styles.readyCount}>Listos para importar: {readyCount}</p>
      <Button variant="primary" className={styles.sendButton} disabled>
        Enviar (próximamente)
      </Button>
      <p className={styles.note}>El envío por lotes llega en un cambio posterior (import-send).</p>
    </div>
  );
}
