'use client';

import { useState, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
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

  const showIcon = variant === 'search' ? <Search size={18} /> : icon;

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
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
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
