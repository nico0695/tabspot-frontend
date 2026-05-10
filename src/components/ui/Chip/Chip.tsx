'use client';

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './Chip.module.css';

export interface ChipProps {
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function Chip({ selected, onSelect, onRemove, disabled, children, className }: ChipProps) {
  const cls = [styles.chip, selected && styles.selected, disabled && styles.disabled, className]
    .filter(Boolean)
    .join(' ');

  const removeButton = onRemove ? (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={styles.removeBtn}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }
      }}
      aria-label="Remove"
    >
      <X size={12} aria-hidden="true" />
    </span>
  ) : null;

  if (onSelect) {
    return (
      <button
        type="button"
        className={cls}
        onClick={onSelect}
        disabled={disabled}
        aria-pressed={selected}
      >
        {children}
        {removeButton}
      </button>
    );
  }

  return (
    <span className={cls}>
      {children}
      {removeButton}
    </span>
  );
}
