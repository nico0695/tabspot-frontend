'use client';

import * as Switch from '@radix-ui/react-switch';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled = false,
  className,
}: ToggleProps) {
  const cls = [styles.toggle, disabled && styles.disabled, className].filter(Boolean).join(' ');

  return (
    <label className={cls}>
      <Switch.Root
        className={styles.track}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(value) => {
          if (typeof value === 'boolean') onChange?.(value);
        }}
        disabled={disabled}
      >
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
      {label}
    </label>
  );
}
