'use client';

import type { ReactNode } from 'react';
import styles from './Chip.module.css';

export interface ChipProps {
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
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
      <RemoveIcon />
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
