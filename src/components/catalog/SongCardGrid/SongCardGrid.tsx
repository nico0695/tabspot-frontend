import type { CatalogSong } from '@/features/catalog/catalog.types';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { SongCard } from '@/components/catalog/SongCard';
import styles from './SongCardGrid.module.css';

export interface SongCardGridProps {
  songs: CatalogSong[];
  artistMap?: Map<string, string>;
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function SongCardGrid({ songs, artistMap, isLoading, isEmpty }: SongCardGridProps) {
  if (isLoading && songs.length === 0) {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={styles.center}>
        <EmptyState title="No songs found" description="Try adjusting your search or filters." />
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {songs.map((song) => (
        <SongCard key={song.id} song={song} artistName={artistMap?.get(song.artistId)} />
      ))}
    </div>
  );
}
