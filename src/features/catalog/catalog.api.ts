import { apiClient } from '@/lib/api/client';
import type { CursorPage } from '@/lib/api/types';
import type {
  CatalogSong,
  SongDetail,
  ArtistOption,
  GenreOption,
  ListSongsParams,
} from './catalog.types';

export function listSongs(params?: ListSongsParams): Promise<CursorPage<CatalogSong>> {
  const searchParams = new URLSearchParams();

  if (params?.cursor) searchParams.set('cursor', params.cursor);
  if (params?.limit != null) searchParams.set('limit', String(params.limit));
  if (params?.q) searchParams.set('q', params.q);
  if (params?.artistId) searchParams.set('artistId', params.artistId);
  if (params?.genreId) searchParams.set('genreId', params.genreId);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.order) searchParams.set('order', params.order);

  const qs = searchParams.toString();
  const path = qs ? `/api/v1/songs?${qs}` : '/api/v1/songs';

  return apiClient.get<CursorPage<CatalogSong>>(path);
}

export function getSongBySlug(slug: string): Promise<SongDetail> {
  return apiClient.get<SongDetail>(`/api/v1/songs/${slug}`);
}

export function listAllArtists(): Promise<ArtistOption[]> {
  return apiClient.get<ArtistOption[]>('/api/v1/artists/all');
}

export function listAllGenres(): Promise<GenreOption[]> {
  return apiClient.get<GenreOption[]>('/api/v1/genres/all');
}
