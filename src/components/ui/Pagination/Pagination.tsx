'use client';

import { Select } from '@/components/ui/Select';
import { IconButton } from '@/components/ui/IconButton';
import styles from './Pagination.module.css';

export interface PaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

function ChevronLeftIcon() {
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function Pagination({
  page,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: PaginationProps) {
  const start = Math.min((page - 1) * pageSize + 1, totalCount);
  const end = Math.min(page * pageSize, totalCount);

  const cls = [styles.pagination, className].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <span className={styles.info}>
        {totalCount === 0 ? 'Sin resultados' : `Mostrando ${start}–${end} de ${totalCount}`}
      </span>
      <div className={styles.controls}>
        {onPageSizeChange && (
          <Select
            options={pageSizeOptions.map((s) => ({ value: String(s), label: `${s} / pág` }))}
            value={String(pageSize)}
            onChange={(val) => onPageSizeChange(Number(val))}
          />
        )}
        <div className={styles.nav}>
          <IconButton
            size="sm"
            label="Página anterior"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon />
          </IconButton>
          <span className={styles.pageNum}>
            {page} / {totalPages}
          </span>
          <IconButton
            size="sm"
            label="Página siguiente"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
