'use client';

import * as z from 'zod';
import {
  useForm,
  Controller,
  type FieldValues,
  type Path,
  type DefaultValues,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, type SelectOption } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Checkbox } from '@/components/ui/Checkbox';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import styles from './FormBuilder.module.css';

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'toggle';

export interface FieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: SelectOption[];
  disabled?: boolean;
  colSpan?: 1 | 2;
  min?: number;
  max?: number;
}

export interface FormBuilderProps<TForm extends FieldValues> {
  schema: z.ZodType<TForm>;
  fields: FieldConfig<TForm>[];
  onSubmit: (data: TForm) => void | Promise<void>;
  defaultValues?: DefaultValues<TForm>;
  loading?: boolean;
  submitLabel?: string;
  columns?: 1 | 2;
  className?: string;
}

export function FormBuilder<TForm extends FieldValues>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  loading = false,
  submitLabel = 'Guardar',
  columns = 1,
  className,
}: FormBuilderProps<TForm>) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TForm>({
    // Zod v4 type inference with @hookform/resolvers requires an explicit cast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    defaultValues,
  });

  const gridCls = [styles.grid, columns === 2 && styles.twoCol, className]
    .filter(Boolean)
    .join(' ');

  function getError(name: string): string | undefined {
    const err = errors[name];
    return err?.message as string | undefined;
  }

  function renderField(field: FieldConfig<TForm>) {
    const fieldError = getError(field.name);
    const spanCls = field.colSpan === 2 ? styles.spanFull : undefined;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password': {
        const variant = field.type === 'password' ? 'password' : 'text';
        return (
          <div key={field.name} className={spanCls}>
            <Input
              variant={variant}
              label={field.label}
              placeholder={field.placeholder}
              error={fieldError}
              hint={field.hint}
              disabled={field.disabled || loading}
              type={field.type === 'email' ? 'email' : undefined}
              {...register(field.name)}
            />
          </div>
        );
      }

      case 'number':
        return (
          <div key={field.name} className={spanCls}>
            <Input
              variant="text"
              label={field.label}
              placeholder={field.placeholder}
              error={fieldError}
              hint={field.hint}
              disabled={field.disabled || loading}
              type="number"
              min={field.min}
              max={field.max}
              {...register(field.name, { valueAsNumber: true })}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className={spanCls}>
            <Textarea
              label={field.label}
              placeholder={field.placeholder}
              error={fieldError}
              hint={field.hint}
              disabled={field.disabled || loading}
              {...register(field.name)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className={spanCls}>
            <Controller
              name={field.name}
              control={control}
              render={({ field: ctrl }) => (
                <Select
                  label={field.label}
                  options={field.options ?? []}
                  value={ctrl.value as string}
                  onChange={ctrl.onChange}
                  placeholder={field.placeholder}
                  error={fieldError}
                  disabled={field.disabled || loading}
                />
              )}
            />
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.name} className={spanCls}>
            <Controller
              name={field.name}
              control={control}
              render={({ field: ctrl }) => (
                <MultiSelect
                  label={field.label}
                  options={field.options ?? []}
                  value={(ctrl.value as string[]) ?? []}
                  onChange={ctrl.onChange}
                  placeholder={field.placeholder}
                  error={fieldError}
                  disabled={field.disabled || loading}
                />
              )}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className={spanCls}>
            <Controller
              name={field.name}
              control={control}
              render={({ field: ctrl }) => (
                <FormField error={fieldError} hint={field.hint}>
                  <Checkbox
                    label={field.label}
                    checked={!!ctrl.value}
                    onChange={ctrl.onChange}
                    disabled={field.disabled || loading}
                  />
                </FormField>
              )}
            />
          </div>
        );

      case 'toggle':
        return (
          <div key={field.name} className={spanCls}>
            <Controller
              name={field.name}
              control={control}
              render={({ field: ctrl }) => (
                <FormField error={fieldError} hint={field.hint}>
                  <Toggle
                    label={field.label}
                    checked={!!ctrl.value}
                    onChange={ctrl.onChange}
                    disabled={field.disabled || loading}
                  />
                </FormField>
              )}
            />
          </div>
        );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={gridCls}>{fields.map(renderField)}</div>
      <div className={styles.footer}>
        <Button type="submit" variant="primary" disabled={loading} className={styles.submitBtn}>
          {loading && <Spinner size="sm" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
