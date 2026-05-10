'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useSongBySlug } from '@/features/catalog/catalog.hooks';
import { ApiError } from '@/lib/api/types';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import type { SongTab } from '@/features/catalog/catalog.types';
import styles from './page.module.css';

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

function formatDifficulty(value: string): string {
  return DIFFICULTY_LABELS[value] ?? value;
}

export default function SongDetailPage() {
  const params = useParams<{ slug: string }>();
  const { data: song, isLoading, error } = useSongBySlug(params.slug);

  if (isLoading) {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className={styles.center}>
          <EmptyState
            title="Song not found"
            description="The song you're looking for doesn't exist."
          />
        </div>
      );
    }

    return (
      <div className={styles.center}>
        <EmptyState
          title="Something went wrong"
          description="Unable to load the song. Please try again later."
        />
      </div>
    );
  }

  if (!song) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{song.title}</h1>
        <Link href={`/artists/${song.artist.slug}`} className={styles.artistLink}>
          {song.artist.name}
        </Link>
        {song.subtitle && <p className={styles.subtitle}>{song.subtitle}</p>}
        {song.releaseYear && <span className={styles.releaseYear}>{song.releaseYear}</span>}
      </div>

      {song.genres.length > 0 && (
        <div className={styles.genreRow}>
          {song.genres.map((g) => (
            <Chip key={g.id}>{g.name}</Chip>
          ))}
        </div>
      )}

      <div className={styles.tabsSection}>
        <h2 className={styles.tabsHeading}>
          Available Tabs <span className={styles.tabsCount}>({song.tabs.data.length})</span>
        </h2>

        {song.tabs.data.length === 0 ? (
          <EmptyState
            title="No tabs available yet"
            description="Be the first to contribute a tab for this song."
          />
        ) : (
          <div className={styles.tabList}>
            {song.tabs.data.map((tab: SongTab) => (
              <Link key={tab.id} href={`/tabs/${tab.id}`} className={styles.tabItem}>
                <div className={styles.tabBadges}>
                  <Badge variant="type">{tab.tabType}</Badge>
                  <Badge variant="instrument">{tab.instrument}</Badge>
                  <Badge>{formatDifficulty(tab.difficulty)}</Badge>
                </div>
                <div className={styles.tabMeta}>
                  <span>{tab.authorDisplayName ?? 'Anonymous'}</span>
                  <span>{format(new Date(tab.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
