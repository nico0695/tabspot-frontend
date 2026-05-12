import type { CatalogArtist } from '@/features/catalog/catalog.types';
import { ArtistCard } from '@/components/catalog/ArtistCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from './ArtistCardGrid.module.css';

export interface ArtistCardGridProps {
  artists: CatalogArtist[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function ArtistCardGrid({ artists, isLoading, isEmpty }: ArtistCardGridProps) {
  if (isLoading && artists.length === 0) {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={styles.center}>
        <EmptyState title="No artists found" description="Try adjusting your search." />
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
    </div>
  );
}
