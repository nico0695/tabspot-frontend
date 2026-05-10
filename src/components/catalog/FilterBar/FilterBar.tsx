'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import styles from './FilterBar.module.css';

const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'createdAt-desc', label: 'Newest' },
  { value: 'createdAt-asc', label: 'Oldest' },
];

export interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  genreId: string;
  onGenreChange: (value: string) => void;
  genreOptions: { value: string; label: string }[];
  artistId: string;
  onArtistChange: (value: string) => void;
  artistOptions: { value: string; label: string }[];
  sortValue: string;
  onSortChange: (value: string) => void;
}

export function FilterBar({
  search,
  onSearchChange,
  genreId,
  onGenreChange,
  genreOptions,
  artistId,
  onArtistChange,
  artistOptions,
  sortValue,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.searchField}>
        <Input
          variant="search"
          placeholder="Search songs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className={styles.selectField}>
        <Select
          placeholder="All genres"
          options={genreOptions}
          value={genreId}
          onChange={onGenreChange}
        />
      </div>
      <div className={styles.selectField}>
        <Select
          placeholder="All artists"
          options={artistOptions}
          value={artistId}
          onChange={onArtistChange}
        />
      </div>
      <div className={styles.selectField}>
        <Select
          placeholder="Sort by"
          options={SORT_OPTIONS}
          value={sortValue}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}
