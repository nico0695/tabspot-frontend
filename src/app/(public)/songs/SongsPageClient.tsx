'use client';

import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSongs, useAllArtists, useAllGenres } from '@/features/catalog/catalog.hooks';
import { FilterBar } from '@/components/catalog/FilterBar';
import { SongCardGrid } from '@/components/catalog/SongCardGrid';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import styles from './page.module.css';

const ALL_VALUE = '__all__';

export function SongsPageClient() {
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState(ALL_VALUE);
  const [artistId, setArtistId] = useState(ALL_VALUE);
  const [sort, setSort] = useState('title-asc');

  const debouncedSearch = useDebounce(search, 300);

  const [sortBy, order] = sort.split('-') as ['title' | 'createdAt', 'asc' | 'desc'];

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useSongs({
    q: debouncedSearch || undefined,
    genreId: genreId === ALL_VALUE ? undefined : genreId,
    artistId: artistId === ALL_VALUE ? undefined : artistId,
    sortBy,
    order,
  });

  const { data: genres } = useAllGenres();
  const { data: artists } = useAllArtists();

  const songs = data?.pages.flatMap((page) => page.data) ?? [];

  const artistMap = useMemo(() => {
    if (!artists) return undefined;
    return new Map(artists.map((a) => [a.id, a.name]));
  }, [artists]);

  const genreOptions = useMemo(() => {
    const opts = (genres ?? []).map((g) => ({ value: g.id, label: g.name }));
    return [{ value: ALL_VALUE, label: 'All genres' }, ...opts];
  }, [genres]);

  const artistOptions = useMemo(() => {
    const opts = (artists ?? []).map((a) => ({ value: a.id, label: a.name }));
    return [{ value: ALL_VALUE, label: 'All artists' }, ...opts];
  }, [artists]);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Songs</h1>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        genreId={genreId}
        onGenreChange={setGenreId}
        genreOptions={genreOptions}
        artistId={artistId}
        onArtistChange={setArtistId}
        artistOptions={artistOptions}
        sortValue={sort}
        onSortChange={setSort}
      />
      <SongCardGrid
        songs={songs}
        artistMap={artistMap}
        isLoading={isLoading}
        isEmpty={songs.length === 0 && !isLoading}
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
