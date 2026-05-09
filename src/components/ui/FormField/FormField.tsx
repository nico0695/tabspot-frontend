import type { ReactNode } from 'react';
import styles from './FormField.module.css';

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  hint,
  htmlFor,
  required,
  children,
  className,
}: FormFieldProps) {
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = hint && !error && htmlFor ? `${htmlFor}-hint` : undefined;

  const wrapperCls = [styles.field, error && styles.hasError, className].filter(Boolean).join(' ');

  return (
    <div className={wrapperCls}>
      {label && (
        <label htmlFor={htmlFor} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      {children}

      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}

      {hint && !error && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}
