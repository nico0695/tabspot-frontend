'use client';

import { useState, useCallback } from 'react';
import { DataTable, type ActionConfig, type SortDirection } from '@/components/crud/DataTable';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { useAdminArtists } from '@/features/admin/artists/artists.hooks';
import { artistColumns } from '@/features/admin/artists/artists.columns';
import type { AdminArtist, ArtistFormModalMode } from '@/features/admin/artists/artists.types';
import { useDebounce } from '@/hooks/useDebounce';
import { ArtistFormModal } from './components/ArtistFormModal';
import styles from './page.module.css';

export default function AdminArtistsPage() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<SortDirection | undefined>();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [modalState, setModalState] = useState<{
    mode: ArtistFormModalMode;
    artist?: AdminArtist;
  } | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const query = useAdminArtists({
    page,
    pageSize: 20,
    q: debouncedSearch || undefined,
    includeDeleted: includeDeleted || undefined,
  });

  const handleSort = useCallback((col: string, dir: SortDirection) => {
    setSortBy(col);
    setSortDirection(dir);
  }, []);

  const actions: ActionConfig<AdminArtist>[] = [
    {
      label: 'Ver',
      icon: <Eye size={16} />,
      onClick: (row) => setModalState({ mode: 'detail', artist: row }),
    },
    {
      label: 'Editar',
      icon: <Pencil size={16} />,
      onClick: (row) => setModalState({ mode: 'edit', artist: row }),
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={16} />,
      onClick: (row) => setModalState({ mode: 'delete', artist: row }),
      variant: 'danger',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Artistas</h1>
      </div>

      <DataTable
        columns={artistColumns}
        data={query.data?.data ?? []}
        loading={query.isLoading}
        actions={actions}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        searchValue={searchInput}
        searchPlaceholder="Buscar artista..."
        onSearchChange={handleSearchChange}
        pagination={query.data?.pageInfo}
        onPageChange={setPage}
        onRefresh={() => query.refetch()}
        emptyTitle="No hay artistas"
        emptyDescription="Creá el primer artista para empezar"
        toolbar={
          <div className={styles.toolbarActions}>
            <Toggle
              label="Incluir eliminados"
              checked={includeDeleted}
              onChange={setIncludeDeleted}
            />
            <Button variant="primary" onClick={() => setModalState({ mode: 'create' })}>
              Crear artista
            </Button>
          </div>
        }
      />

      {modalState && (
        <ArtistFormModal
          mode={modalState.mode}
          artist={modalState.artist}
          open={true}
          onOpenChange={(open) => {
            if (!open) setModalState(null);
          }}
        />
      )}
    </div>
  );
}
