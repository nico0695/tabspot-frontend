'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { parseChordPro } from '@/features/tabs/parser/parser';
import { ChordProRenderer } from '@/features/tabs/components/ChordProRenderer/ChordProRenderer';
import { ActionBar } from '@/features/tabs/components/ActionBar/ActionBar';
import { Badge } from '@/components/ui/Badge';
import type { TabDetail } from '@/features/tabs/tabs.types';
import styles from './page.module.css';

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

interface TabDetailClientProps {
  tab: TabDetail;
}

export function TabDetailClient({ tab }: TabDetailClientProps) {
  const parsedSong = useMemo(() => parseChordPro(tab.content), [tab.content]);
  const [transpose, setTranspose] = useState(0);

  return (
    <div className={styles.page}>
      <Link href={`/songs/${tab.song.slug}`} className={styles.backLink}>
        <ArrowLeft size={20} />
        Back
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{tab.song.title}</h1>
        <Link href={`/artists/${tab.song.artist.slug}`} className={styles.artistLink}>
          {tab.song.artist.name}
        </Link>
        <div className={styles.badgeRow}>
          <Badge variant="type">{tab.tabType}</Badge>
          <Badge variant="instrument">{tab.instrument}</Badge>
          <Badge>{DIFFICULTY_LABELS[tab.difficulty] ?? tab.difficulty}</Badge>
        </div>
        <div className={styles.meta}>
          <span>{tab.authorDisplayName ?? 'Anonymous'}</span>
          <span>{format(new Date(tab.createdAt), 'MMM d, yyyy')}</span>
        </div>
      </div>

      <div className={styles.scoreArea}>
        <div className={styles.scoreContainer}>
          <ChordProRenderer song={parsedSong} transpose={transpose} />
        </div>
        <ActionBar
          transpose={transpose}
          originalKey={parsedSong.key}
          onTransposeUp={() => setTranspose((t) => t + 1)}
          onTransposeDown={() => setTranspose((t) => t - 1)}
          onTransposeReset={() => setTranspose(0)}
        />
      </div>
    </div>
  );
}
