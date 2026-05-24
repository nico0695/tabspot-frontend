'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import type { AdminTab } from './tabs.types';
import { STATUS_VARIANT } from './tabs.constants';

const columnHelper = createColumnHelper<AdminTab>();

export const tabColumns = [
  columnHelper.accessor((row) => row.song.title, {
    id: 'songTitle',
    header: 'Canción',
    enableSorting: false,
  }),
  columnHelper.accessor((row) => row.song.artist.name, {
    id: 'artistName',
    header: 'Artista',
    enableSorting: false,
  }),
  columnHelper.accessor('tabType', {
    header: 'Tipo',
    enableSorting: false,
    cell: (info) => <Badge variant="type">{info.getValue()}</Badge>,
  }),
  columnHelper.accessor('instrument', {
    header: 'Instrumento',
    enableSorting: false,
    cell: (info) => <Badge variant="instrument">{info.getValue()}</Badge>,
  }),
  columnHelper.accessor('status', {
    header: 'Estado',
    enableSorting: false,
    cell: (info) => {
      const value = info.getValue();
      const variant = STATUS_VARIANT[value] ?? 'default';
      return <Badge variant={variant}>{value}</Badge>;
    },
  }),
  columnHelper.accessor((row) => row.author.displayName ?? row.author.email, {
    id: 'author',
    header: 'Autor',
    enableSorting: false,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Creado',
    enableSorting: true,
    cell: (info) => new Date(info.getValue()).toLocaleDateString('es-AR'),
  }),
];
