'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useChangeUserRole, useChangeUserStatus } from '@/features/admin/users/users.hooks';
import type { AdminUser, UserActionModalMode } from '@/features/admin/users/users.types';
import { showToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { MODAL_TITLES, ROLE_OPTIONS, STATUS_OPTIONS } from '../users.constants';
import styles from './UserActionModal.module.css';

interface UserActionModalProps {
  mode: UserActionModalMode;
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function roleBadge(role: string) {
  return role === 'ADMIN' ? (
    <Badge variant="instrument">Admin</Badge>
  ) : (
    <Badge variant="default">Usuario</Badge>
  );
}

function statusBadge(status: string) {
  return status === 'ACTIVE' ? (
    <Badge variant="published">Activo</Badge>
  ) : (
    <Badge variant="rejected">Bloqueado</Badge>
  );
}

function UserDetail({ user }: { user: AdminUser }) {
  return (
    <div className={styles.detailGrid}>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Email</span>
        <span className={styles.detailValue}>{user.email}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Nombre</span>
        <span className={styles.detailValue}>{user.displayName ?? '—'}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Rol</span>
        <span className={styles.detailValue}>{roleBadge(user.role)}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Estado</span>
        <span className={styles.detailValue}>{statusBadge(user.status)}</span>
      </div>
      {user.blockedAt && (
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Bloqueado el</span>
          <span className={styles.detailValue}>{formatDate(user.blockedAt)}</span>
        </div>
      )}
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Registrado</span>
        <span className={styles.detailValue}>{formatDate(user.createdAt)}</span>
      </div>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>Actualizado</span>
        <span className={styles.detailValue}>{formatDate(user.updatedAt)}</span>
      </div>
    </div>
  );
}

export function UserActionModal({ mode, user, open, onOpenChange }: UserActionModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedStatus, setSelectedStatus] = useState(user.status);

  const roleMutation = useChangeUserRole();
  const statusMutation = useChangeUserStatus();

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setApiError(null);
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const handleChangeRole = async () => {
    if (selectedRole === user.role) {
      handleOpenChange(false);
      return;
    }
    try {
      setApiError(null);
      await roleMutation.mutateAsync({ id: user.id, data: { role: selectedRole } });
      showToast.success('Rol actualizado');
      handleOpenChange(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error inesperado al cambiar el rol';
      showToast.error(message);
      setApiError(message);
    }
  };

  const handleChangeStatus = async () => {
    if (selectedStatus === user.status) {
      handleOpenChange(false);
      return;
    }
    try {
      setApiError(null);
      await statusMutation.mutateAsync({ id: user.id, data: { status: selectedStatus } });
      if (selectedStatus === 'BLOCKED') {
        showToast.warning('Usuario bloqueado');
      } else {
        showToast.success('Usuario activado');
      }
      handleOpenChange(false);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Error inesperado al cambiar el estado';
      showToast.error(message);
      setApiError(message);
    }
  };

  if (mode === 'detail') {
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
        <UserDetail user={user} />
      </Modal>
    );
  }

  if (mode === 'change-role') {
    return (
      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title={MODAL_TITLES['change-role']}
        maxWidth={480}
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={roleMutation.isPending}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleChangeRole} disabled={roleMutation.isPending}>
              {roleMutation.isPending && <Spinner size="sm" />}
              Guardar
            </Button>
          </>
        }
      >
        {apiError && (
          <div className={styles.error} role="alert">
            {apiError}
          </div>
        )}
        <div className={styles.actionForm}>
          <div className={styles.currentValue}>Rol actual: {roleBadge(user.role)}</div>
          <Select
            label="Nuevo rol"
            options={ROLE_OPTIONS}
            value={selectedRole}
            onChange={setSelectedRole}
          />
        </div>
      </Modal>
    );
  }

  if (mode === 'change-status') {
    return (
      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title={MODAL_TITLES['change-status']}
        maxWidth={480}
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={statusMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant={selectedStatus === 'BLOCKED' ? 'danger' : 'primary'}
              onClick={handleChangeStatus}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending && <Spinner size="sm" />}
              {selectedStatus === 'BLOCKED' ? 'Bloquear' : 'Activar'}
            </Button>
          </>
        }
      >
        {apiError && (
          <div className={styles.error} role="alert">
            {apiError}
          </div>
        )}
        <div className={styles.actionForm}>
          <div className={styles.currentValue}>Estado actual: {statusBadge(user.status)}</div>
          <Select
            label="Nuevo estado"
            options={STATUS_OPTIONS}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>
      </Modal>
    );
  }

  return null;
}
