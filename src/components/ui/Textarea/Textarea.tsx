import { useId, type TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  disabled,
  id: externalId,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = externalId ?? generatedId;
  const errorId = error ? `${textareaId}-error` : undefined;
  const hintId = hint && !error ? `${textareaId}-hint` : undefined;

  const wrapperCls = [styles.wrapper, error && styles.hasError, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperCls}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputContainer}>
        <textarea
          id={textareaId}
          className={styles.textarea}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? hintId}
          {...rest}
        />
      </div>
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
