'use client';

import { useState, useCallback, useMemo } from 'react';
import { DataTable, type ActionConfig, type SortDirection } from '@/components/crud/DataTable';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { useAdminTabs } from '@/features/admin/tabs/tabs.hooks';
import { tabColumns } from '@/features/admin/tabs/tabs.columns';
import type { AdminTab, TabFormModalMode } from '@/features/admin/tabs/tabs.types';
import { TabFormModal } from './components/TabFormModal';
import styles from './page.module.css';

const ALL_STATUS_VALUE = '__all__';

const STATUS_FILTER_OPTIONS = [
  { value: ALL_STATUS_VALUE, label: 'Todos los estados' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function AdminTabsPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<SortDirection | undefined>();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalState, setModalState] = useState<{
    mode: TabFormModalMode;
    tab?: AdminTab;
  } | null>(null);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value === ALL_STATUS_VALUE ? undefined : value);
    setPage(1);
  }, []);

  const query = useAdminTabs({
    page,
    pageSize: 20,
    status: statusFilter,
    includeDeleted: includeDeleted || undefined,
  });

  const handleSort = useCallback((col: string, dir: SortDirection) => {
    setSortBy(col);
    setSortDirection(dir);
  }, []);

  const actions: ActionConfig<AdminTab>[] = useMemo(
    () => [
      {
        label: 'Ver',
        icon: <Eye size={16} />,
        onClick: (row) => setModalState({ mode: 'detail', tab: row }),
      },
      {
        label: 'Editar',
        icon: <Pencil size={16} />,
        onClick: (row) => setModalState({ mode: 'edit', tab: row }),
      },
      {
        label: 'Eliminar',
        icon: <Trash2 size={16} />,
        onClick: (row) => setModalState({ mode: 'delete', tab: row }),
        variant: 'danger',
      },
    ],
    [],
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tabs</h1>
      </div>

      <DataTable
        columns={tabColumns}
        data={query.data?.data ?? []}
        loading={query.isLoading}
        actions={actions}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        pagination={query.data?.pageInfo}
        onPageChange={setPage}
        onRefresh={() => query.refetch()}
        emptyTitle="No hay tabs"
        emptyDescription="Creá la primera tab para empezar"
        toolbar={
          <div className={styles.toolbarActions}>
            <Select
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter ?? ALL_STATUS_VALUE}
              onChange={handleStatusFilterChange}
              placeholder="Filtrar por estado"
            />
            <Toggle
              label="Incluir eliminados"
              checked={includeDeleted}
              onChange={setIncludeDeleted}
            />
            <Button variant="primary" onClick={() => setModalState({ mode: 'create' })}>
              Crear tab
            </Button>
          </div>
        }
      />

      {modalState && (
        <TabFormModal
          mode={modalState.mode}
          tab={modalState.tab}
          open={true}
          onOpenChange={(open) => {
            if (!open) setModalState(null);
          }}
        />
      )}
    </div>
  );
}
