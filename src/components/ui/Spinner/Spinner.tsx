import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const cls = [styles.spinner, styles[`s_${size}`], className].filter(Boolean).join(' ');
  return <div className={cls} role="status" aria-label="Loading" />;
}
