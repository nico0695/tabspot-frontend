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

export interface CatalogArtist {
  id: string;
  name: string;
  slug: string;
  sortName: string;
}

export interface ArtistDetail {
  id: string;
  name: string;
  slug: string;
  sortName: string;
  songs: ArtistSong[];
}

export interface ArtistSong {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  releaseYear: number | null;
  publishedTabCount: number;
}

export interface ListArtistsParams {
  cursor?: string;
  limit?: number;
  q?: string;
  sortBy?: 'name' | 'createdAt';
  order?: 'asc' | 'desc';
}
