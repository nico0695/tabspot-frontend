'use client';

import { type ReactNode } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { ChevronUp, ChevronDown, RotateCw, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import styles from './DataTable.module.css';

export type SortDirection = 'asc' | 'desc';

export interface ActionConfig<T> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'danger';
  hidden?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  data: T[];
  loading?: boolean;
  actions?: ActionConfig<T>[];
  sortBy?: string;
  sortDirection?: SortDirection;
  onSort?: (columnId: string, direction: SortDirection) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRefresh?: () => void;
  toolbar?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

function SortIcon({ active, direction }: { active: boolean; direction?: SortDirection }) {
  const Icon = direction === 'desc' ? ChevronDown : ChevronUp;
  return <Icon size={12} className={active ? styles.sortActive : styles.sortInactive} />;
}

function ActionsCell<T>({ row, actions }: { row: T; actions: ActionConfig<T>[] }) {
  const visible = actions.filter((a) => !a.hidden?.(row));
  if (visible.length === 0) return null;

  if (visible.length <= 3) {
    return (
      <div className={styles.actionsInline}>
        {visible.map((action) => (
          <IconButton
            key={action.label}
            size="sm"
            label={action.label}
            onClick={() => action.onClick(row)}
          >
            {action.icon ?? <span className={styles.actionLabel}>{action.label[0]}</span>}
          </IconButton>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.actionsInline}>
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <IconButton size="sm" label="Acciones">
            <MoreVertical size={16} />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {visible.map((action) => (
            <DropdownMenu.Item
              key={action.label}
              variant={action.variant}
              onSelect={() => action.onClick(row)}
            >
              {action.icon && <span className={styles.menuIcon}>{action.icon}</span>}
              {action.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  actions,
  sortBy,
  sortDirection,
  onSort,
  searchValue,
  searchPlaceholder = 'Buscar...',
  onSearchChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  toolbar,
  emptyTitle = 'Sin resultados',
  emptyDescription,
  className,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const totalColumns = columns.length + (actions ? 1 : 0);
  const showToolbar = onSearchChange || toolbar || onRefresh;

  const wrapperCls = [styles.wrapper, className].filter(Boolean).join(' ');

  function handleHeaderClick(columnId: string) {
    if (!onSort) return;
    const nextDir: SortDirection = sortBy === columnId && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnId, nextDir);
  }

  return (
    <div className={wrapperCls}>
      {showToolbar && (
        <div className={styles.toolbar}>
          {onSearchChange && (
            <div className={styles.searchSlot}>
              <Input
                variant="search"
                size="compact"
                placeholder={searchPlaceholder}
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          <div className={styles.toolbarRight}>
            {toolbar}
            {onRefresh && (
              <IconButton size="sm" label="Actualizar" onClick={onRefresh}>
                <RotateCw size={16} />
              </IconButton>
            )}
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = onSort && header.column.columnDef.enableSorting !== false;
                  const isActive = sortBy === header.column.id;

                  return (
                    <th
                      key={header.id}
                      className={isSortable ? styles.thSortable : undefined}
                      onClick={isSortable ? () => handleHeaderClick(header.column.id) : undefined}
                    >
                      <span className={styles.thContent}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && (
                          <SortIcon
                            active={isActive}
                            direction={isActive ? sortDirection : undefined}
                          />
                        )}
                      </span>
                    </th>
                  );
                })}
                {actions && <th className={styles.thActions}>Acciones</th>}
              </tr>
            ))}
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={totalColumns} className={styles.emptyCell}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
                {actions && (
                  <td className={styles.actionsCell}>
                    <ActionsCell row={row.original} actions={actions} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className={styles.loadingOverlay}>
            <Spinner size="md" />
          </div>
        )}
      </div>

      {pagination && onPageChange && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
