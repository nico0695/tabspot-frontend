'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { FormBuilder, type FieldConfig } from '@/components/crud/FormBuilder';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import {
  useCreateArtist,
  useUpdateArtist,
  useDeleteArtist,
} from '@/features/admin/artists/artists.hooks';
import { artistFormSchema, type ArtistFormData } from '@/features/admin/artists/artists.schema';
import type { AdminArtist, ArtistFormModalMode } from '@/features/admin/artists/artists.types';
import { showToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { MODAL_TITLES, FORM_FIELDS } from '../artists.constants';
import styles from './ArtistFormModal.module.css';

interface ArtistFormModalProps {
  mode: ArtistFormModalMode;
  artist?: AdminArtist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ArtistDetail({ artist }: { artist: AdminArtist }) {
  return (
    <div className={styles.detailGrid}>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Nombre</span>
        <span className={styles.detailValue}>{artist.name}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Slug</span>
        <span className={styles.detailCode}>{artist.slug}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Nombre de orden</span>
        <span className={styles.detailValue}>{artist.sortName ?? '—'}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Estado</span>
        <span className={styles.detailValue}>
          {artist.deletedAt == null ? (
            <Badge variant="published">Activo</Badge>
          ) : (
            <Badge variant="rejected">Eliminado</Badge>
          )}
        </span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Creado</span>
        <span className={styles.detailValue}>{formatDate(artist.createdAt)}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Actualizado</span>
        <span className={styles.detailValue}>{formatDate(artist.updatedAt)}</span>
      </div>
    </div>
  );
}

export function ArtistFormModal({ mode, artist, open, onOpenChange }: ArtistFormModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const createMutation = useCreateArtist();
  const updateMutation = useUpdateArtist();
  const deleteMutation = useDeleteArtist();

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setApiError(null);
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const handleCreate = async (data: ArtistFormData) => {
    try {
      setApiError(null);
      await createMutation.mutateAsync(data);
      showToast.success('Artista creado');
      handleOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Error inesperado al crear el artista';
      showToast.error(message);
      setApiError(message);
    }
  };

  const handleEdit = async (data: ArtistFormData) => {
    if (!artist) return;
    try {
      setApiError(null);
      await updateMutation.mutateAsync({ id: artist.id, data });
      showToast.success('Artista actualizado');
      handleOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Error inesperado al actualizar el artista';
      showToast.error(message);
      setApiError(message);
    }
  };

  const handleDelete = async () => {
    if (!artist) return;
    try {
      setApiError(null);
      await deleteMutation.mutateAsync(artist.id);
      showToast.success('Artista eliminado');
      handleOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Error inesperado al eliminar el artista';
      showToast.error(message);
      setApiError(message);
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
        <FormBuilder<ArtistFormData>
          schema={artistFormSchema}
          fields={FORM_FIELDS}
          onSubmit={handleCreate}
          loading={createMutation.isPending}
          submitLabel="Crear"
        />
      </Modal>
    );
  }

  if (mode === 'edit' && artist) {
    return (
      <Modal open={open} onOpenChange={handleOpenChange} title={MODAL_TITLES.edit} maxWidth={480}>
        {apiError && (
          <div className={styles.error} role="alert">
            {apiError}
          </div>
        )}
        <FormBuilder<ArtistFormData>
          schema={artistFormSchema}
          fields={FORM_FIELDS}
          onSubmit={handleEdit}
          defaultValues={{ name: artist.name, sortName: artist.sortName ?? '' }}
          loading={updateMutation.isPending}
          submitLabel="Guardar"
        />
      </Modal>
    );
  }

  if (mode === 'detail' && artist) {
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
        <ArtistDetail artist={artist} />
      </Modal>
    );
  }

  if (mode === 'delete' && artist) {
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
        <ArtistDetail artist={artist} />
      </Modal>
    );
  }

  return null;
}
