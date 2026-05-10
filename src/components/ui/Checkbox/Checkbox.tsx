'use client';

import * as RadixCheckbox from '@radix-ui/react-checkbox';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled = false,
  className,
}: CheckboxProps) {
  const cls = [styles.checkbox, disabled && styles.disabled, className].filter(Boolean).join(' ');

  return (
    <label className={cls}>
      <RadixCheckbox.Root
        className={styles.box}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(value) => {
          if (typeof value === 'boolean') onChange?.(value);
        }}
        disabled={disabled}
      >
        <RadixCheckbox.Indicator className={styles.indicator} />
      </RadixCheckbox.Root>
      {label}
    </label>
  );
}
