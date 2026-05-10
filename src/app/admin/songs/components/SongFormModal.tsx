'use client';

import { useState, useCallback, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { FormBuilder, type FieldConfig } from '@/components/crud/FormBuilder';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useCreateSong, useUpdateSong, useDeleteSong } from '@/features/admin/songs/songs.hooks';
import { songFormSchema, type SongFormData } from '@/features/admin/songs/songs.schema';
import type { AdminSong, SongFormModalMode } from '@/features/admin/songs/songs.types';
import { useAdminArtists } from '@/features/admin/artists';
import { useAdminGenres } from '@/features/admin/genres';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { cleanSongData } from '@/features/admin/songs/songs.utils';
import { MODAL_TITLES } from '../songs.constants';
import styles from './SongFormModal.module.css';

interface SongFormModalProps {
  mode: SongFormModalMode;
  song?: AdminSong;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SongDetail({ song }: { song: AdminSong }) {
  return (
    <div className={styles.detailGrid}>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Título</span>
        <span className={styles.detailValue}>{song.title}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Slug</span>
        <span className={styles.detailCode}>{song.slug}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Artista</span>
        <span className={styles.detailValue}>{song.artist.name}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Subtítulo</span>
        <span className={styles.detailValue}>{song.subtitle ?? '—'}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Año de lanzamiento</span>
        <span className={styles.detailValue}>{song.releaseYear ?? '—'}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Géneros</span>
        <span className={styles.detailValue}>
          {song.songGenres.length > 0 ? song.songGenres.map((sg) => sg.genre.name).join(', ') : '—'}
        </span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Estado</span>
        <span className={styles.detailValue}>
          {song.deletedAt == null ? (
            <Badge variant="published">Activo</Badge>
          ) : (
            <Badge variant="rejected">Eliminado</Badge>
          )}
        </span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Creado</span>
        <span className={styles.detailValue}>{formatDate(song.createdAt)}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Actualizado</span>
        <span className={styles.detailValue}>{formatDate(song.updatedAt)}</span>
      </div>
    </div>
  );
}

export function SongFormModal({ mode, song, open, onOpenChange }: SongFormModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const createMutation = useCreateSong();
  const updateMutation = useUpdateSong();
  const deleteMutation = useDeleteSong();

  const artistsQuery = useAdminArtists({ pageSize: 500 });
  const genresQuery = useAdminGenres({ pageSize: 500 });

  const artistOptions = useMemo(
    () => (artistsQuery.data?.data ?? []).map((a) => ({ value: a.id, label: a.name })),
    [artistsQuery.data],
  );

  const genreOptions = useMemo(
    () => (genresQuery.data?.data ?? []).map((g) => ({ value: g.id, label: g.name })),
    [genresQuery.data],
  );

  const isLoadingOptions = artistsQuery.isLoading || genresQuery.isLoading;

  const formFields: FieldConfig<SongFormData>[] = useMemo(
    () => [
      {
        name: 'artistId',
        type: 'select' as const,
        label: 'Artista',
        placeholder: 'Seleccioná un artista',
        options: artistOptions,
      },
      {
        name: 'title',
        type: 'text' as const,
        label: 'Título',
        placeholder: 'Ej: Persiana Americana',
      },
      {
        name: 'subtitle',
        type: 'text' as const,
        label: 'Subtítulo',
        placeholder: 'Ej: Versión acústica',
      },
      {
        name: 'releaseYear',
        type: 'number' as const,
        label: 'Año de lanzamiento',
        placeholder: 'Ej: 2024',
        hint: 'Ej: 2024',
        min: 1900,
        max: 2100,
      },
      {
        name: 'genreIds',
        type: 'multiselect' as const,
        label: 'Géneros',
        placeholder: 'Seleccioná géneros',
        options: genreOptions,
      },
    ],
    [artistOptions, genreOptions],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setApiError(null);
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const handleCreate = async (data: SongFormData) => {
    try {
      setApiError(null);
      await createMutation.mutateAsync(cleanSongData(data));
      handleOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('Error inesperado al crear la canción');
      }
    }
  };

  const handleEdit = async (data: SongFormData) => {
    if (!song) return;
    try {
      setApiError(null);
      const cleaned = cleanSongData(data);
      await updateMutation.mutateAsync({
        id: song.id,
        data: {
          title: cleaned.title,
          subtitle: cleaned.subtitle ?? null,
          releaseYear: cleaned.releaseYear ?? null,
          genreIds: cleaned.genreIds,
        },
      });
      handleOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('Error inesperado al actualizar la canción');
      }
    }
  };

  const handleDelete = async () => {
    if (!song) return;
    try {
      setApiError(null);
      await deleteMutation.mutateAsync(song.id);
      handleOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('Error inesperado al eliminar la canción');
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
        {isLoadingOptions ? (
          <div className={styles.loading}>
            <Spinner size="md" />
          </div>
        ) : (
          <FormBuilder<SongFormData>
            schema={songFormSchema}
            fields={formFields}
            onSubmit={handleCreate}
            loading={createMutation.isPending}
            submitLabel="Crear"
          />
        )}
      </Modal>
    );
  }

  if (mode === 'edit' && song) {
    return (
      <Modal open={open} onOpenChange={handleOpenChange} title={MODAL_TITLES.edit} maxWidth={480}>
        {apiError && (
          <div className={styles.error} role="alert">
            {apiError}
          </div>
        )}
        {isLoadingOptions ? (
          <div className={styles.loading}>
            <Spinner size="md" />
          </div>
        ) : (
          <FormBuilder<SongFormData>
            schema={songFormSchema}
            fields={formFields}
            onSubmit={handleEdit}
            defaultValues={{
              artistId: song.artistId,
              title: song.title,
              subtitle: song.subtitle ?? '',
              releaseYear: song.releaseYear ?? undefined,
              genreIds: song.songGenres.map((sg) => sg.genre.id),
            }}
            loading={updateMutation.isPending}
            submitLabel="Guardar"
          />
        )}
      </Modal>
    );
  }

  if (mode === 'detail' && song) {
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
        <SongDetail song={song} />
      </Modal>
    );
  }

  if (mode === 'delete' && song) {
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
        <SongDetail song={song} />
      </Modal>
    );
  }

  return null;
}
