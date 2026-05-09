import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const cls = [styles.emptyState, className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <strong className={styles.title}>{title}</strong>
      {description && <span className={styles.description}>{description}</span>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
