'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useDeleteTab } from '@/features/admin/tabs/tabs.hooks';
import type { AdminTab, TabFormModalMode } from '@/features/admin/tabs/tabs.types';
import { MODAL_TITLES, STATUS_VARIANT } from '@/features/admin/tabs/tabs.constants';
import { showToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';
import { TabDetail } from './TabDetail';
import { TabForm } from './TabForm';
import styles from './TabFormModal.module.css';

interface TabFormModalProps {
  mode: TabFormModalMode;
  tab?: AdminTab;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TabFormModal({ mode, tab, open, onOpenChange }: TabFormModalProps) {
  const deleteMutation = useDeleteTab();
  const [apiError, setApiError] = useState<string | null>(null);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setApiError(null);
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const handleDelete = async () => {
    if (!tab) return;
    try {
      setApiError(null);
      await deleteMutation.mutateAsync(tab.id);
      showToast.success('Tab eliminada');
      handleOpenChange(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error inesperado al eliminar la tab';
      showToast.error(message);
      setApiError(message);
    }
  };

  if (mode === 'create') {
    return (
      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title={MODAL_TITLES.create}
        maxWidth={1060}
      >
        <TabForm mode="create" onSuccess={() => handleOpenChange(false)} />
      </Modal>
    );
  }

  if (mode === 'edit' && tab) {
    return (
      <Modal open={open} onOpenChange={handleOpenChange} title={MODAL_TITLES.edit} maxWidth={1060}>
        <TabForm mode="edit" tab={tab} onSuccess={() => handleOpenChange(false)} />
      </Modal>
    );
  }

  if (mode === 'detail' && tab) {
    return (
      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title={MODAL_TITLES.detail}
        maxWidth={1060}
        actions={
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Cerrar
          </Button>
        }
      >
        <TabDetail tab={tab} />
      </Modal>
    );
  }

  if (mode === 'delete' && tab) {
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
        <div className={styles.detailGrid}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Canción</span>
            <span className={styles.detailValue}>
              {tab.song.title} — {tab.song.artist.name}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Tipo</span>
            <span className={styles.detailValue}>{tab.tabType}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Estado</span>
            <span className={styles.detailValue}>
              <Badge variant={STATUS_VARIANT[tab.status] ?? 'default'}>{tab.status}</Badge>
            </span>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
}
