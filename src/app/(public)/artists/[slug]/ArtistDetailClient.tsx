'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ArtistDetail } from '@/features/catalog/catalog.types';
import styles from './page.module.css';

interface ArtistDetailClientProps {
  artist: ArtistDetail;
}

export function ArtistDetailClient({ artist }: ArtistDetailClientProps) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{artist.name}</h1>
      </div>

      <div className={styles.songsSection}>
        <h2 className={styles.songsHeading}>
          Songs <span className={styles.songsCount}>({artist.songs.length})</span>
        </h2>

        {artist.songs.length === 0 ? (
          <EmptyState
            title="No songs available yet"
            description="This artist doesn't have any songs listed."
          />
        ) : (
          <div className={styles.songList}>
            {artist.songs.map((song) => (
              <Link key={song.id} href={`/songs/${song.slug}`} className={styles.songItem}>
                <div className={styles.songInfo}>
                  <span className={styles.songTitle}>{song.title}</span>
                  {song.subtitle && <span className={styles.songSubtitle}>{song.subtitle}</span>}
                </div>
                <div className={styles.songMeta}>
                  {song.releaseYear && <span className={styles.songYear}>{song.releaseYear}</span>}
                  {song.publishedTabCount > 0 && (
                    <Badge>
                      {song.publishedTabCount} {song.publishedTabCount === 1 ? 'tab' : 'tabs'}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
