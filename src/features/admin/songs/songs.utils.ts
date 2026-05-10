import type { SongFormData } from './songs.schema';

export function cleanSongData(data: SongFormData) {
  return {
    ...data,
    subtitle: data.subtitle && data.subtitle.length > 0 ? data.subtitle : undefined,
    releaseYear:
      data.releaseYear != null && !Number.isNaN(data.releaseYear) ? data.releaseYear : undefined,
    genreIds: data.genreIds && data.genreIds.length > 0 ? data.genreIds : undefined,
  };
}
