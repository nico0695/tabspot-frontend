'use client';

import { useState, useId } from 'react';
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
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const active = isControlled ? checked : internal;
  const id = useId();

  const handleChange = () => {
    if (disabled) return;
    const next = !active;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const cls = [styles.checkbox, active && styles.checked, disabled && styles.disabled, className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={cls} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className={styles.hiddenInput}
        checked={active}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className={styles.box} />
      {label}
    </label>
  );
}
