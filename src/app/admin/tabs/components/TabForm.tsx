'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Tabs, TabsContent } from '@/components/ui/Tabs';
import { useCreateTab, useUpdateTab } from '@/features/admin/tabs/tabs.hooks';
import { useSongSelectOptions } from '@/features/admin/songs/songs.hooks';
import { tabFormSchema, type TabFormData } from '@/features/admin/tabs/tabs.schema';
import type { AdminTab } from '@/features/admin/tabs/tabs.types';
import {
  TAB_TYPE_OPTIONS,
  INSTRUMENT_OPTIONS,
  DIFFICULTY_OPTIONS,
  STATUS_OPTIONS,
} from '@/features/admin/tabs/tabs.constants';
import { showToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';
import { TabEditor } from './TabEditor';
import styles from './TabForm.module.css';

interface TabFormProps {
  mode: 'create' | 'edit';
  tab?: AdminTab;
  onSuccess: () => void;
}

const TAB_ITEMS = [
  { value: 'data', label: 'Datos' },
  { value: 'content', label: 'Contenido' },
];

export function TabForm({ mode, tab, onSuccess }: TabFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMutation = useCreateTab();
  const updateMutation = useUpdateTab();
  const songsQuery = useSongSelectOptions();

  const songOptions = useMemo(() => songsQuery.data ?? [], [songsQuery.data]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TabFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tabFormSchema as any) as any,
    defaultValues: {
      songId: tab?.songId ?? '',
      content: tab?.content ?? '',
      tabType: tab?.tabType ?? '',
      instrument: tab?.instrument ?? '',
      difficulty: tab?.difficulty ?? '',
      titleOverride: tab?.titleOverride ?? '',
      status: tab?.status ?? 'DRAFT',
      moderationNotes: tab?.moderationNotes ?? '',
    },
  });

  const onSubmit = async (data: TabFormData) => {
    try {
      setApiError(null);
      if (mode === 'create') {
        const payload = {
          songId: data.songId,
          content: data.content,
          tabType: data.tabType,
          instrument: data.instrument,
          difficulty: data.difficulty,
          titleOverride: data.titleOverride || undefined,
          status: data.status || undefined,
          moderationNotes: data.moderationNotes || null,
        };
        await createMutation.mutateAsync(payload);
        showToast.success('Tab creada');
      } else if (tab) {
        const payload = {
          content: data.content,
          tabType: data.tabType,
          instrument: data.instrument,
          difficulty: data.difficulty,
          titleOverride: data.titleOverride || null,
          status: data.status || undefined,
          moderationNotes: data.moderationNotes || null,
        };
        await updateMutation.mutateAsync({ id: tab.id, data: payload });
        showToast.success('Tab actualizada');
      }
      onSuccess();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error inesperado';
      showToast.error(message);
      setApiError(message);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (songsQuery.isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {apiError && (
        <div className={styles.error} role="alert">
          {apiError}
        </div>
      )}

      <Tabs items={TAB_ITEMS} defaultValue="data">
        <TabsContent value="data">
          <div className={styles.tabPanel}>
            <div className={styles.metadataSection}>
              <Controller
                name="songId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Canción"
                    options={songOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccioná una canción"
                    error={errors.songId?.message}
                    disabled={mode === 'edit'}
                  />
                )}
              />
              <Controller
                name="tabType"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Tipo"
                    options={TAB_TYPE_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccioná tipo"
                    error={errors.tabType?.message}
                  />
                )}
              />
              <Controller
                name="instrument"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Instrumento"
                    options={INSTRUMENT_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccioná instrumento"
                    error={errors.instrument?.message}
                  />
                )}
              />
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Dificultad"
                    options={DIFFICULTY_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccioná dificultad"
                    error={errors.difficulty?.message}
                  />
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Estado"
                    options={STATUS_OPTIONS}
                    value={field.value ?? 'DRAFT'}
                    onChange={field.onChange}
                    placeholder="Estado"
                  />
                )}
              />
              <Controller
                name="titleOverride"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Título override"
                    placeholder="Opcional"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={errors.titleOverride?.message}
                  />
                )}
              />
              <Controller
                name="moderationNotes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Notas de moderación"
                    placeholder="Opcional"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    rows={2}
                  />
                )}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="content">
          <div className={styles.tabPanel}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TabEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.content?.message}
                />
              )}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending && <Spinner size="sm" />}
          {mode === 'create' ? 'Crear' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
