'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import type { AdminGenre } from './types';

const columnHelper = createColumnHelper<AdminGenre>();

export const genreColumns = [
  columnHelper.accessor('name', {
    header: 'Nombre',
    enableSorting: true,
  }),
  columnHelper.accessor('slug', {
    header: 'Slug',
    enableSorting: false,
    cell: (info) => (
      <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>
        {info.getValue()}
      </code>
    ),
  }),
  columnHelper.accessor('deletedAt', {
    header: 'Estado',
    enableSorting: false,
    cell: (info) => {
      const deletedAt = info.getValue();
      return deletedAt == null ? (
        <Badge variant="published">Activo</Badge>
      ) : (
        <Badge variant="rejected">Eliminado</Badge>
      );
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Creado',
    enableSorting: true,
    cell: (info) => new Date(info.getValue()).toLocaleDateString('es-AR'),
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Actualizado',
    enableSorting: true,
    cell: (info) => new Date(info.getValue()).toLocaleDateString('es-AR'),
  }),
];
