import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeVariant =
  | 'default'
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'instrument'
  | 'type';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const cls = [styles.badge, styles[`v_${variant}`], className].filter(Boolean).join(' ');
  return <span className={cls}>{children}</span>;
}
