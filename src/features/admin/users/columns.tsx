'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import type { AdminUser } from './types';

const columnHelper = createColumnHelper<AdminUser>();

export const userColumns = [
  columnHelper.accessor('email', {
    header: 'Email',
    enableSorting: true,
  }),
  columnHelper.accessor('displayName', {
    header: 'Nombre',
    enableSorting: true,
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('role', {
    header: 'Rol',
    enableSorting: false,
    cell: (info) => {
      const role = info.getValue();
      return role === 'ADMIN' ? (
        <Badge variant="instrument">Admin</Badge>
      ) : (
        <Badge variant="default">Usuario</Badge>
      );
    },
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    enableSorting: false,
    cell: (info) => {
      const status = info.getValue();
      return status === 'ACTIVE' ? (
        <Badge variant="published">Activo</Badge>
      ) : (
        <Badge variant="rejected">Bloqueado</Badge>
      );
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Registrado',
    enableSorting: true,
    cell: (info) => new Date(info.getValue()).toLocaleDateString('es-AR'),
  }),
];
