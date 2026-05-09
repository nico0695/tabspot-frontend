import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export type IconButtonSize = 'md' | 'sm';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  size?: IconButtonSize;
  label: string;
  children: ReactNode;
  className?: string;
}

export function IconButton({
  size = 'md',
  label,
  children,
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  const cls = [styles.iconBtn, styles[`s_${size}`], className].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} aria-label={label} {...rest}>
      {children}
    </button>
  );
}
