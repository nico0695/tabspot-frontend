'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useArtists } from '@/features/catalog/catalog.hooks';
import { ArtistCardGrid } from '@/components/catalog/ArtistCardGrid';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import styles from './page.module.css';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
];

export function ArtistsPageClient() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name-asc');
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, order] = sort.split('-') as ['name' | 'createdAt', 'asc' | 'desc'];

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useArtists({
    q: debouncedSearch || undefined,
    sortBy,
    order,
  });

  const artists = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Artists</h1>
      <div className={styles.filters}>
        <div className={styles.searchField}>
          <Input
            variant="search"
            placeholder="Search artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.sortField}>
          <Select options={SORT_OPTIONS} value={sort} onChange={setSort} />
        </div>
      </div>
      <ArtistCardGrid
        artists={artists}
        isLoading={isLoading}
        isEmpty={artists.length === 0 && !isLoading}
      />
      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button variant="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? <Spinner size="sm" /> : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
