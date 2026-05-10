import Link from 'next/link';
import type { CatalogSong, GenreOption } from '@/features/catalog/catalog.types';
import { Badge } from '@/components/ui/Badge';
import styles from './SongCard.module.css';

export interface SongCardProps {
  song: CatalogSong;
  artistName?: string;
  genres?: GenreOption[];
}

export function SongCard({ song, artistName, genres }: SongCardProps) {
  const displayGenres = genres?.slice(0, 3);

  return (
    <Link href={`/songs/${song.slug}`} className={styles.link}>
      <article className={styles.card}>
        <h3 className={styles.title}>{song.title}</h3>
        {artistName && <span className={styles.artist}>{artistName}</span>}
        {song.subtitle && <span className={styles.subtitle}>{song.subtitle}</span>}
        {displayGenres && displayGenres.length > 0 && (
          <div className={styles.genres}>
            {displayGenres.map((genre) => (
              <Badge key={genre.id}>{genre.name}</Badge>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
