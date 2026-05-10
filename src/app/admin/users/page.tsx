'use client';

import { useState, useCallback } from 'react';
import { DataTable, type ActionConfig } from '@/components/crud/DataTable';
import { Eye, Shield, UserCheck } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useAdminUsers } from '@/features/admin/users/users.hooks';
import { userColumns } from '@/features/admin/users/users.columns';
import type { AdminUser, UserActionModalMode } from '@/features/admin/users/users.types';
import { useAuthStore } from '@/store/useAuthStore';
import { UserActionModal } from './components/UserActionModal';
import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from './users.constants';
import styles from './page.module.css';

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
      icon: <Eye size={16} />,
      onClick: (row) => setModalState({ mode: 'detail', user: row }),
    },
    {
      label: 'Cambiar rol',
      icon: <Shield size={16} />,
      onClick: (row) => setModalState({ mode: 'change-role', user: row }),
      hidden: isSelf,
    },
    {
      label: 'Cambiar estado',
      icon: <UserCheck size={16} />,
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
