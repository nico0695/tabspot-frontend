'use client';

import { useState } from 'react';
import styles from './SegmentedControl.module.css';

export type SegmentedOption = { value: string; label: string; disabled?: boolean };
export type SegmentedSize = 'md' | 'sm';
export type SegmentedShape = 'rounded' | 'pill';

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: SegmentedSize;
  shape?: SegmentedShape;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  shape = 'rounded',
  className,
}: SegmentedControlProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? '');
  const controlled = value !== undefined;
  const activeValue = controlled ? value : internalValue;

  const containerCls = [styles.container, styles[`s_${size}`], styles[`sh_${shape}`], className]
    .filter(Boolean)
    .join(' ');

  function handleSelect(optValue: string) {
    if (!controlled) {
      setInternalValue(optValue);
    }
    onChange?.(optValue);
  }

  return (
    <div role="radiogroup" className={containerCls}>
      {options.map((opt) => {
        const isActive = opt.value === activeValue;
        const optCls = [
          styles.option,
          isActive && styles.active,
          opt.disabled && styles.optionDisabled,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={optCls}
            disabled={opt.disabled}
            onClick={() => handleSelect(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
