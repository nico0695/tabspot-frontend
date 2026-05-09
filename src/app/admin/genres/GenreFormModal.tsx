'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { FormBuilder, type FieldConfig } from '@/components/crud/FormBuilder';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useCreateGenre, useUpdateGenre, useDeleteGenre } from '@/features/admin/genres/hooks';
import { genreFormSchema, type GenreFormData } from '@/features/admin/genres/schema';
import type { AdminGenre } from '@/features/admin/genres/types';
import { ApiError } from '@/lib/api';
import styles from './GenreFormModal.module.css';

export type GenreFormModalMode = 'create' | 'edit' | 'detail' | 'delete';

interface GenreFormModalProps {
  mode: GenreFormModalMode;
  genre?: AdminGenre;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODAL_TITLES: Record<GenreFormModalMode, string> = {
  create: 'Crear género',
  edit: 'Editar género',
  detail: 'Detalle del género',
  delete: 'Eliminar género',
};

const FORM_FIELDS: FieldConfig<GenreFormData>[] = [
  { name: 'name', type: 'text', label: 'Nombre', placeholder: 'Ej: Rock' },
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function GenreDetail({ genre }: { genre: AdminGenre }) {
  return (
    <div className={styles.detailGrid}>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Nombre</span>
        <span className={styles.detailValue}>{genre.name}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Slug</span>
        <span className={styles.detailCode}>{genre.slug}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Creado</span>
        <span className={styles.detailValue}>{formatDate(genre.createdAt)}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Actualizado</span>
        <span className={styles.detailValue}>{formatDate(genre.updatedAt)}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Estado</span>
        <span className={styles.detailValue}>
          {genre.deletedAt == null ? (
            <Badge variant="published">Activo</Badge>
          ) : (
            <Badge variant="rejected">Eliminado</Badge>
          )}
        </span>
      </div>
    </div>
  );
}

export function GenreFormModal({ mode, genre, open, onOpenChange }: GenreFormModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const createMutation = useCreateGenre();
  const updateMutation = useUpdateGenre();
  const deleteMutation = useDeleteGenre();

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setApiError(null);
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const handleCreate = async (data: GenreFormData) => {
    try {
      setApiError(null);
      await createMutation.mutateAsync(data);
      handleOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('Error inesperado al crear el género');
      }
    }
  };

  const handleEdit = async (data: GenreFormData) => {
    if (!genre) return;
    try {
      setApiError(null);
      await updateMutation.mutateAsync({ id: genre.id, data });
      handleOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('Error inesperado al actualizar el género');
      }
    }
  };

  const handleDelete = async () => {
    if (!genre) return;
    try {
      setApiError(null);
      await deleteMutation.mutateAsync(genre.id);
      handleOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('Error inesperado al eliminar el género');
      }
    }
  };

  if (mode === 'create') {
    return (
      <Modal open={open} onOpenChange={handleOpenChange} title={MODAL_TITLES.create} maxWidth={480}>
        {apiError && (
          <div className={styles.error} role="alert">
            {apiError}
          </div>
        )}
        <FormBuilder<GenreFormData>
          schema={genreFormSchema}
          fields={FORM_FIELDS}
          onSubmit={handleCreate}
          loading={createMutation.isPending}
          submitLabel="Crear"
        />
      </Modal>
    );
  }

  if (mode === 'edit' && genre) {
    return (
      <Modal open={open} onOpenChange={handleOpenChange} title={MODAL_TITLES.edit} maxWidth={480}>
        {apiError && (
          <div className={styles.error} role="alert">
            {apiError}
          </div>
        )}
        <FormBuilder<GenreFormData>
          schema={genreFormSchema}
          fields={FORM_FIELDS}
          onSubmit={handleEdit}
          defaultValues={{ name: genre.name }}
          loading={updateMutation.isPending}
          submitLabel="Guardar"
        />
      </Modal>
    );
  }

  if (mode === 'detail' && genre) {
    return (
      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title={MODAL_TITLES.detail}
        maxWidth={480}
        actions={
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cerrar
          </Button>
        }
      >
        <GenreDetail genre={genre} />
      </Modal>
    );
  }

  if (mode === 'delete' && genre) {
    return (
      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title={MODAL_TITLES.delete}
        description="Esta acción no se puede deshacer"
        maxWidth={480}
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Spinner size="sm" />}
              Eliminar
            </Button>
          </>
        }
      >
        {apiError && (
          <div className={styles.error} role="alert">
            {apiError}
          </div>
        )}
        <GenreDetail genre={genre} />
      </Modal>
    );
  }

  return null;
}
