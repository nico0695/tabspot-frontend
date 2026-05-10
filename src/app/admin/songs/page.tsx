'use client';

import { useState, useCallback, useMemo } from 'react';
import { DataTable, type ActionConfig, type SortDirection } from '@/components/crud/DataTable';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { useAdminSongs } from '@/features/admin/songs/hooks';
import { songColumns } from '@/features/admin/songs/columns';
import type { AdminSong } from '@/features/admin/songs/types';
import { useAdminArtists } from '@/features/admin/artists';
import { useDebounce } from '@/hooks/useDebounce';
import { SongFormModal, type SongFormModalMode } from './SongFormModal';
import styles from './page.module.css';

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
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

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

const ALL_ARTISTS_VALUE = '__all__';

export default function AdminSongsPage() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<SortDirection | undefined>();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [artistFilter, setArtistFilter] = useState<string | undefined>();
  const [modalState, setModalState] = useState<{
    mode: SongFormModalMode;
    song?: AdminSong;
  } | null>(null);

  const artistsQuery = useAdminArtists({ pageSize: 500 });

  const artistFilterOptions = useMemo(
    () => [
      { value: ALL_ARTISTS_VALUE, label: 'Todos los artistas' },
      ...(artistsQuery.data?.data ?? []).map((a) => ({ value: a.id, label: a.name })),
    ],
    [artistsQuery.data],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleArtistFilterChange = useCallback((value: string) => {
    setArtistFilter(value === ALL_ARTISTS_VALUE ? undefined : value);
    setPage(1);
  }, []);

  const query = useAdminSongs({
    page,
    pageSize: 20,
    q: debouncedSearch || undefined,
    artistId: artistFilter,
    includeDeleted: includeDeleted || undefined,
  });

  const handleSort = useCallback((col: string, dir: SortDirection) => {
    setSortBy(col);
    setSortDirection(dir);
  }, []);

  const actions: ActionConfig<AdminSong>[] = [
    {
      label: 'Ver',
      icon: <EyeIcon />,
      onClick: (row) => setModalState({ mode: 'detail', song: row }),
    },
    {
      label: 'Editar',
      icon: <EditIcon />,
      onClick: (row) => setModalState({ mode: 'edit', song: row }),
    },
    {
      label: 'Eliminar',
      icon: <TrashIcon />,
      onClick: (row) => setModalState({ mode: 'delete', song: row }),
      variant: 'danger',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Canciones</h1>
      </div>

      <DataTable
        columns={songColumns}
        data={query.data?.data ?? []}
        loading={query.isLoading}
        actions={actions}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        searchValue={searchInput}
        searchPlaceholder="Buscar canción..."
        onSearchChange={handleSearchChange}
        pagination={query.data?.pageInfo}
        onPageChange={setPage}
        onRefresh={() => query.refetch()}
        emptyTitle="No hay canciones"
        emptyDescription="Creá la primera canción para empezar"
        toolbar={
          <div className={styles.toolbarActions}>
            <Select
              options={artistFilterOptions}
              value={artistFilter ?? ALL_ARTISTS_VALUE}
              onChange={handleArtistFilterChange}
              placeholder="Filtrar por artista"
            />
            <Toggle
              label="Incluir eliminados"
              checked={includeDeleted}
              onChange={setIncludeDeleted}
            />
            <Button variant="primary" onClick={() => setModalState({ mode: 'create' })}>
              Crear canción
            </Button>
          </div>
        }
      />

      {modalState && (
        <SongFormModal
          mode={modalState.mode}
          song={modalState.song}
          open={true}
          onOpenChange={(open) => {
            if (!open) setModalState(null);
          }}
        />
      )}
    </div>
  );
}
