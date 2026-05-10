'use client';

import { useState, useCallback } from 'react';
import { DataTable, type ActionConfig, type SortDirection } from '@/components/crud/DataTable';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { useAdminGenres } from '@/features/admin/genres/hooks';
import { genreColumns } from '@/features/admin/genres/columns';
import type { AdminGenre } from '@/features/admin/genres/types';
import { useDebounce } from '@/hooks/useDebounce';
import { GenreFormModal, type GenreFormModalMode } from './GenreFormModal';
import styles from './page.module.css';

export default function AdminGenresPage() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<SortDirection | undefined>();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [modalState, setModalState] = useState<{
    mode: GenreFormModalMode;
    genre?: AdminGenre;
  } | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const query = useAdminGenres({
    page,
    pageSize: 20,
    q: debouncedSearch || undefined,
    includeDeleted: includeDeleted || undefined,
  });

  const handleSort = useCallback((col: string, dir: SortDirection) => {
    setSortBy(col);
    setSortDirection(dir);
  }, []);

  const actions: ActionConfig<AdminGenre>[] = [
    {
      label: 'Ver',
      icon: <Eye size={16} />,
      onClick: (row) => setModalState({ mode: 'detail', genre: row }),
    },
    {
      label: 'Editar',
      icon: <Pencil size={16} />,
      onClick: (row) => setModalState({ mode: 'edit', genre: row }),
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={16} />,
      onClick: (row) => setModalState({ mode: 'delete', genre: row }),
      variant: 'danger',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Géneros</h1>
      </div>

      <DataTable
        columns={genreColumns}
        data={query.data?.data ?? []}
        loading={query.isLoading}
        actions={actions}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        searchValue={searchInput}
        searchPlaceholder="Buscar género..."
        onSearchChange={handleSearchChange}
        pagination={query.data?.pageInfo}
        onPageChange={setPage}
        onRefresh={() => query.refetch()}
        emptyTitle="No hay géneros"
        emptyDescription="Creá el primer género para empezar"
        toolbar={
          <div className={styles.toolbarActions}>
            <Toggle
              label="Incluir eliminados"
              checked={includeDeleted}
              onChange={setIncludeDeleted}
            />
            <Button variant="primary" onClick={() => setModalState({ mode: 'create' })}>
              Crear género
            </Button>
          </div>
        }
      />

      {modalState && (
        <GenreFormModal
          mode={modalState.mode}
          genre={modalState.genre}
          open={true}
          onOpenChange={(open) => {
            if (!open) setModalState(null);
          }}
        />
      )}
    </div>
  );
}
