'use client';

import { useState, useCallback } from 'react';
import { DataTable, type ActionConfig } from '@/components/crud/DataTable';
import { Select } from '@/components/ui/Select';
import { useAdminUsers } from '@/features/admin/users/hooks';
import { userColumns } from '@/features/admin/users/columns';
import type { AdminUser } from '@/features/admin/users/types';
import { useAuthStore } from '@/store/useAuthStore';
import { UserActionModal, type UserActionModalMode } from './UserActionModal';
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

function ShieldIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function UserCheckIcon() {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  );
}

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Todos los roles' },
  { value: 'USER', label: 'Usuario' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'BLOCKED', label: 'Bloqueado' },
];

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalState, setModalState] = useState<{
    mode: UserActionModalMode;
    user: AdminUser;
  } | null>(null);

  const currentUser = useAuthStore((s) => s.user);

  const handleRoleFilter = useCallback((value: string) => {
    setRoleFilter(value);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const query = useAdminUsers({
    page,
    pageSize: 20,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  });

  const isSelf = (row: AdminUser) => currentUser?.email === row.email;

  const actions: ActionConfig<AdminUser>[] = [
    {
      label: 'Ver',
      icon: <EyeIcon />,
      onClick: (row) => setModalState({ mode: 'detail', user: row }),
    },
    {
      label: 'Cambiar rol',
      icon: <ShieldIcon />,
      onClick: (row) => setModalState({ mode: 'change-role', user: row }),
      hidden: isSelf,
    },
    {
      label: 'Cambiar estado',
      icon: <UserCheckIcon />,
      onClick: (row) => setModalState({ mode: 'change-status', user: row }),
      hidden: isSelf,
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Usuarios</h1>
      </div>

      <DataTable
        columns={userColumns}
        data={query.data?.data ?? []}
        loading={query.isLoading}
        actions={actions}
        pagination={query.data?.pageInfo}
        onPageChange={setPage}
        onRefresh={() => query.refetch()}
        emptyTitle="No hay usuarios"
        emptyDescription="No se encontraron usuarios con los filtros aplicados"
        toolbar={
          <div className={styles.toolbarFilters}>
            <div className={styles.filterSelect}>
              <Select
                options={ROLE_FILTER_OPTIONS}
                value={roleFilter}
                onChange={handleRoleFilter}
                placeholder="Rol"
              />
            </div>
            <div className={styles.filterSelect}>
              <Select
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={handleStatusFilter}
                placeholder="Estado"
              />
            </div>
          </div>
        }
      />

      {modalState && (
        <UserActionModal
          mode={modalState.mode}
          user={modalState.user}
          open={true}
          onOpenChange={(open) => {
            if (!open) setModalState(null);
          }}
        />
      )}
    </div>
  );
}
