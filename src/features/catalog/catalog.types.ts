import type { CursorPage } from '@/lib/api/types';

export interface CatalogSong {
  id: string;
  artistId: string;
  title: string;
  slug: string;
  subtitle: string | null;
  releaseYear: number | null;
}

export interface SongTab {
  id: string;
  titleOverride: string | null;
  tabType: string;
  instrument: string;
  difficulty: string;
  authorDisplayName: string | null;
  createdAt: string;
}

export interface SongDetailArtist {
  id: string;
  name: string;
  slug: string;
}

export interface SongDetailGenre {
  id: string;
  name: string;
  slug: string;
}

export interface SongDetail {
  id: string;
  artistId: string;
  title: string;
  slug: string;
  subtitle: string | null;
  releaseYear: number | null;
  artist: SongDetailArtist;
  genres: SongDetailGenre[];
  tabs: CursorPage<SongTab>;
}

export interface ArtistOption {
  id: string;
  name: string;
  slug: string;
}

export interface GenreOption {
  id: string;
  name: string;
  slug: string;
}

export interface ListSongsParams {
  cursor?: string;
  limit?: number;
  q?: string;
  artistId?: string;
  genreId?: string;
  sortBy?: 'title' | 'createdAt';
  order?: 'asc' | 'desc';
}
