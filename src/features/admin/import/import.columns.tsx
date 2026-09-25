'use client';

import { createColumnHelper } from '@tanstack/react-table';
import type { ImportVersionRecord } from './import.types';
import {
  TAB_TYPE_LABELS,
  INSTRUMENT_LABELS,
  DIFFICULTY_LABELS,
  TAB_STATUS_LABELS,
  IMPORT_VERSION_STATUS_LABELS,
} from './import.constants';

const columnHelper = createColumnHelper<ImportVersionRecord>();

export const importVersionColumns = [
  columnHelper.accessor('versionLabel', {
    header: 'Versión',
    enableSorting: false,
  }),

  // meta.editable signals the review table to render an inline text input
  columnHelper.accessor('title', {
    header: 'Título',
    enableSorting: false,
    meta: { editable: true },
  }),

  columnHelper.accessor('tabType', {
    header: 'Tipo',
    enableSorting: false,
    cell: (info) => TAB_TYPE_LABELS[info.getValue()],
  }),

  columnHelper.accessor('instrument', {
    header: 'Instrumento',
    enableSorting: false,
    cell: (info) => INSTRUMENT_LABELS[info.getValue()],
  }),

  columnHelper.accessor('difficulty', {
    header: 'Dificultad',
    enableSorting: false,
    cell: (info) => DIFFICULTY_LABELS[info.getValue()],
  }),

  columnHelper.accessor('targetStatus', {
    header: 'Estado',
    enableSorting: false,
    cell: (info) => TAB_STATUS_LABELS[info.getValue()],
  }),

  columnHelper.accessor('status', {
    header: 'Revisión',
    enableSorting: false,
    cell: (info) => IMPORT_VERSION_STATUS_LABELS[info.getValue()],
  }),

  columnHelper.accessor('warnings', {
    header: 'Avisos',
    enableSorting: false,
    cell: (info) => {
      const warnings = info.getValue();
      if (warnings.length === 0) return null;
      return warnings.length === 1 ? '1 aviso' : `${warnings.length} avisos`;
    },
  }),
];
