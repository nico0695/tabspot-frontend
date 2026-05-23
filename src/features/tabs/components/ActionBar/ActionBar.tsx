import { Minus, Plus, RotateCcw } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import styles from './ActionBar.module.css';

interface ActionBarProps {
  transpose: number;
  originalKey: string | null;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onTransposeReset: () => void;
}

function formatKeyDisplay(originalKey: string | null, transpose: number): string {
  if (transpose === 0) return originalKey ?? '0';
  const sign = transpose > 0 ? '+' : '';
  if (originalKey) return `${originalKey} (${sign}${transpose})`;
  return `${sign}${transpose}`;
}

export function ActionBar({
  transpose,
  originalKey,
  onTransposeUp,
  onTransposeDown,
  onTransposeReset,
}: ActionBarProps) {
  return (
    <aside className={styles.panel}>
      <span className={styles.label}>Transpose</span>

      <div className={styles.stepper}>
        <IconButton
          label="Transpose down"
          onClick={onTransposeDown}
          size="sm"
          className={styles.stepperBtn}
        >
          <Minus size={16} />
        </IconButton>

        <span className={styles.stepperKey}>{formatKeyDisplay(originalKey, transpose)}</span>

        <IconButton
          label="Transpose up"
          onClick={onTransposeUp}
          size="sm"
          className={styles.stepperBtn}
        >
          <Plus size={16} />
        </IconButton>
      </div>

      {transpose !== 0 && (
        <IconButton
          label="Reset transpose"
          onClick={onTransposeReset}
          size="sm"
          className={styles.resetBtn}
        >
          <RotateCcw size={14} />
        </IconButton>
      )}
    </aside>
  );
}
