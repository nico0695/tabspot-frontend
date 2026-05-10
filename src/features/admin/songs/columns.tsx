'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import type { AdminSong } from './types';

const columnHelper = createColumnHelper<AdminSong>();

export const songColumns = [
  columnHelper.accessor('title', {
    header: 'Título',
    enableSorting: true,
  }),
  columnHelper.accessor((row) => row.artist.name, {
    id: 'artistName',
    header: 'Artista',
    enableSorting: false,
  }),
  columnHelper.accessor('subtitle', {
    header: 'Subtítulo',
    enableSorting: false,
    cell: (info) => {
      const value = info.getValue();
      return value ?? '—';
    },
  }),
  columnHelper.accessor('releaseYear', {
    header: 'Año',
    enableSorting: true,
    cell: (info) => {
      const value = info.getValue();
      return value ?? '—';
    },
  }),
  columnHelper.display({
    id: 'genres',
    header: 'Géneros',
    cell: (info) => {
      const genres = info.row.original.songGenres;
      if (!genres.length) return '—';
      return genres.map((sg) => sg.genre.name).join(', ');
    },
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
];
