import Link from 'next/link';
import type { CatalogArtist } from '@/features/catalog/catalog.types';
import styles from './ArtistCard.module.css';

export interface ArtistCardProps {
  artist: CatalogArtist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/artists/${artist.slug}`} className={styles.link}>
      <article className={styles.card}>
        <h3 className={styles.name}>{artist.name}</h3>
      </article>
    </Link>
  );
}
