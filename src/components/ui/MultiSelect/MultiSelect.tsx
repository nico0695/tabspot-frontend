'use client';

import { useState, useId } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Search, X } from 'lucide-react';
import type { SelectOption } from '@/components/ui/Select';
import styles from './MultiSelect.module.css';

export interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  label,
  error,
  loading = false,
  disabled = false,
  className,
}: MultiSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const generatedId = useId();
  const errorId = error ? `${generatedId}-error` : undefined;

  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean) as SelectOption[];

  function toggleOption(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  function removeOption(optionValue: string) {
    onChange(value.filter((v) => v !== optionValue));
  }

  const wrapperCls = [styles.wrapper, error && styles.hasError, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperCls}>
      {label && <label className={styles.label}>{label}</label>}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <button
            type="button"
            className={styles.trigger}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
          >
            {selectedLabels.length > 0 ? (
              <div className={styles.chips}>
                {selectedLabels.map((opt) => (
                  <span key={opt.value} className={styles.chip}>
                    {opt.label}
                    {!disabled && (
                      <button
                        type="button"
                        className={styles.chipRemove}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOption(opt.value);
                        }}
                        aria-label={`Quitar ${opt.label}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <span className={styles.placeholder}>{placeholder}</span>
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className={styles.content} sideOffset={4} align="start">
            <div className={styles.searchBox}>
              <Search size={14} />
              <input
                className={styles.searchInput}
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.list}>
              {loading && <div className={styles.loadingText}>Cargando...</div>}
              {!loading && filtered.length === 0 && (
                <div className={styles.emptyText}>Sin resultados</div>
              )}
              {!loading &&
                filtered.map((option) => {
                  const checked = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={checked ? styles.optionSelected : styles.option}
                      onClick={() => toggleOption(option.value)}
                      disabled={option.disabled}
                    >
                      <span className={checked ? styles.checkboxChecked : styles.checkbox} />
                      {option.label}
                    </button>
                  );
                })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
