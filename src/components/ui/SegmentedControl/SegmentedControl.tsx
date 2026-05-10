'use client';

import * as RadioGroup from '@radix-ui/react-radio-group';
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
  const containerCls = [styles.container, styles[`s_${size}`], styles[`sh_${shape}`], className]
    .filter(Boolean)
    .join(' ');

  return (
    <RadioGroup.Root
      className={containerCls}
      value={value}
      defaultValue={defaultValue ?? options[0]?.value}
      onValueChange={onChange}
    >
      {options.map((opt) => (
        <RadioGroup.Item
          key={opt.value}
          value={opt.value}
          className={styles.option}
          disabled={opt.disabled}
        >
          {opt.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
