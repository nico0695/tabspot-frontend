'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { parseChordPro } from '@/features/tabs/parser/parser';
import { ChordProRenderer } from '@/features/tabs/components/ChordProRenderer/ChordProRenderer';
import { STATUS_VARIANT } from '@/features/admin/tabs/tabs.constants';
import type { AdminTab } from '@/features/admin/tabs/tabs.types';
import { formatDate } from '@/lib/format';
import styles from './TabDetail.module.css';

interface TabDetailProps {
  tab: AdminTab;
}

export function TabDetail({ tab }: TabDetailProps) {
  const parsedSong = useMemo(() => parseChordPro(tab.content), [tab.content]);

  return (
    <div className={styles.layout}>
      <div className={styles.metadata}>
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Canción</span>
            <span className={styles.metaValue}>
              {tab.song.title} — {tab.song.artist.name}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Tipo</span>
            <span className={styles.metaValue}>
              <Badge variant="type">{tab.tabType}</Badge>
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Instrumento</span>
            <span className={styles.metaValue}>
              <Badge variant="instrument">{tab.instrument}</Badge>
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Dificultad</span>
            <span className={styles.metaValue}>{tab.difficulty}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Estado</span>
            <span className={styles.metaValue}>
              <Badge variant={STATUS_VARIANT[tab.status] ?? 'default'}>{tab.status}</Badge>
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Autor</span>
            <span className={styles.metaValue}>{tab.author.displayName ?? tab.author.email}</span>
          </div>

          {tab.titleOverride && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Título override</span>
              <span className={styles.metaValue}>{tab.titleOverride}</span>
            </div>
          )}

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Versión</span>
            <span className={styles.metaValue}>{tab.versionNumber}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Creado</span>
            <span className={styles.metaValue}>{formatDate(tab.createdAt)}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Actualizado</span>
            <span className={styles.metaValue}>{formatDate(tab.updatedAt)}</span>
          </div>

          {tab.submittedAt && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Enviado</span>
              <span className={styles.metaValue}>{formatDate(tab.submittedAt)}</span>
            </div>
          )}

          {tab.publishedAt && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Publicado</span>
              <span className={styles.metaValue}>{formatDate(tab.publishedAt)}</span>
            </div>
          )}
        </div>

        {tab.moderationNotes && (
          <div className={styles.notesBlock}>
            <span className={styles.metaLabel}>Notas de moderación</span>
            <span className={styles.metaValue}>{tab.moderationNotes}</span>
          </div>
        )}
      </div>

      <div className={styles.preview}>
        <span className={styles.previewLabel}>Preview</span>
        <div className={styles.previewContent}>
          <ChordProRenderer song={parsedSong} transpose={0} />
        </div>
      </div>
    </div>
  );
}
