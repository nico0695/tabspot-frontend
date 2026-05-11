'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { SongDetail, SongTab } from '@/features/catalog/catalog.types';
import styles from './page.module.css';

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

function formatDifficulty(value: string): string {
  return DIFFICULTY_LABELS[value] ?? value;
}

interface SongDetailClientProps {
  song: SongDetail;
}

export function SongDetailClient({ song }: SongDetailClientProps) {
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
