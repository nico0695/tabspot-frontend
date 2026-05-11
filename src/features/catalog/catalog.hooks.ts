import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { ListSongsParams, ListArtistsParams } from './catalog.types';
import {
  listSongs,
  getSongBySlug,
  listAllArtists,
  listAllGenres,
  listArtists,
  getArtistBySlug,
} from './catalog.api';

const CATALOG_SONGS_KEY = ['catalog', 'songs'] as const;
const CATALOG_SONG_DETAIL_KEY = ['catalog', 'song'] as const;
const CATALOG_ARTISTS_KEY = ['catalog', 'artists'] as const;
const CATALOG_ARTIST_DETAIL_KEY = ['catalog', 'artist'] as const;
const CATALOG_GENRES_KEY = ['catalog', 'genres'] as const;

export function useSongs(params?: Omit<ListSongsParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: [...CATALOG_SONGS_KEY, params],
    queryFn: ({ pageParam }) => listSongs({ ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useSongBySlug(slug: string) {
  return useQuery({
    queryKey: [...CATALOG_SONG_DETAIL_KEY, slug],
    queryFn: () => getSongBySlug(slug),
    enabled: !!slug,
  });
}

export function useAllArtists() {
  return useQuery({
    queryKey: [...CATALOG_ARTISTS_KEY],
    queryFn: listAllArtists,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllGenres() {
  return useQuery({
    queryKey: [...CATALOG_GENRES_KEY],
    queryFn: listAllGenres,
    staleTime: 5 * 60 * 1000,
  });
}

export function useArtists(params?: Omit<ListArtistsParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: [...CATALOG_ARTISTS_KEY, 'list', params],
    queryFn: ({ pageParam }) => listArtists({ ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useArtistBySlug(slug: string) {
  return useQuery({
    queryKey: [...CATALOG_ARTIST_DETAIL_KEY, slug],
    queryFn: () => getArtistBySlug(slug),
    enabled: !!slug,
  });
}
