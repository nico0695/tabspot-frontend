export interface AdminSong {
  id: string;
  artistId: string;
  title: string;
  slug: string;
  subtitle: string | null;
  releaseYear: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  artist: { id: string; name: string };
  songGenres: { genre: { id: string; name: string; slug: string } }[];
}

export interface CreateSongInput {
  artistId: string;
  title: string;
  subtitle?: string;
  releaseYear?: number;
  genreIds?: string[];
}

export interface UpdateSongInput {
  title?: string;
  subtitle?: string | null;
  releaseYear?: number | null;
  genreIds?: string[];
}
