'use client';

import { useState, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './Input.module.css';

export type InputVariant = 'text' | 'password' | 'search';
export type InputSize = 'md' | 'compact';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'size'
> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function Input({
  variant = 'text',
  size = 'md',
  label,
  error,
  hint,
  icon,
  className,
  disabled,
  id: externalId,
  type: _type,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = externalId ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint && !error ? `${inputId}-hint` : undefined;

  const resolvedType =
    variant === 'password'
      ? showPassword
        ? 'text'
        : 'password'
      : variant === 'search'
        ? 'search'
        : (_type ?? 'text');

  const wrapperCls = [styles.wrapper, error && styles.hasError, className]
    .filter(Boolean)
    .join(' ');

  const containerCls = [styles.inputContainer, styles[`v_${variant}`], styles[`s_${size}`]]
    .filter(Boolean)
    .join(' ');

  const showIcon = variant === 'search' ? <SearchIcon /> : icon;

  return (
    <div className={wrapperCls}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={containerCls}>
        {showIcon && <span className={styles.iconSlot}>{showIcon}</span>}
        <input
          id={inputId}
          className={styles.input}
          type={resolvedType}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId ?? hintId}
          {...rest}
        />
        {variant === 'password' && (
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPassword((v) => !v)}
            aria-label="Toggle password visibility"
            tabIndex={-1}
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
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
