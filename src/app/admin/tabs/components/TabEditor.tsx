'use client';

import { useMemo } from 'react';
import { parseChordPro } from '@/features/tabs/parser/parser';
import { ChordProRenderer } from '@/features/tabs/components/ChordProRenderer/ChordProRenderer';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './TabEditor.module.css';

interface TabEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TabEditor({ value, onChange, error }: TabEditorProps) {
  const debouncedValue = useDebounce(value, 300);
  const parsedSong = useMemo(
    () => (debouncedValue.trim() ? parseChordPro(debouncedValue) : null),
    [debouncedValue],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.editor}>
        <div className={styles.editorCol}>
          <label className={styles.colLabel}>Contenido ChordPro</label>
          <textarea
            className={styles.textarea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="{title: Mi Canción}&#10;{artist: Artista}&#10;&#10;{start_of_verse}&#10;[Am]Primera línea de la [C]canción&#10;{end_of_verse}"
            spellCheck={false}
          />
        </div>
        <div className={styles.editorCol}>
          <span className={styles.colLabel}>Preview</span>
          <div className={styles.preview}>
            {parsedSong ? (
              <ChordProRenderer song={parsedSong} transpose={0} />
            ) : (
              <p className={styles.emptyPreview}>El preview aparecerá aquí...</p>
            )}
          </div>
        </div>
      </div>
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
