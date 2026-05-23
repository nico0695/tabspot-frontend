import type {
  ParsedSong,
  ParsedSection,
  ParsedLine,
  ChordLyricPair,
} from '@/features/tabs/parser/parser.types';
import { transposeChord } from '@/features/tabs/transpose';
import styles from './ChordProRenderer.module.css';

const SECTION_LABELS: Record<string, string> = {
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  intro: 'Intro',
  outro: 'Outro',
  instrumental: 'Instrumental',
  tab: 'Tab',
};

interface ChordProRendererProps {
  song: ParsedSong;
  transpose: number;
}

function renderPair(pair: ChordLyricPair, transpose: number, index: number) {
  return (
    <span key={index} className={styles.pair}>
      {pair.chord !== null ? (
        <span className={styles.chord}>{transposeChord(pair.chord, transpose)}</span>
      ) : (
        <span className={styles.chordSpacer} />
      )}
      <span className={styles.lyric}>{pair.lyric}</span>
    </span>
  );
}

function renderLine(line: ParsedLine, transpose: number, index: number) {
  switch (line.type) {
    case 'chord-lyric':
      return (
        <div key={index} className={styles.line}>
          {line.pairs?.map((pair, i) => renderPair(pair, transpose, i))}
        </div>
      );
    case 'tab':
      return (
        <pre key={index} className={styles.tabLine}>
          {line.text}
        </pre>
      );
    case 'comment':
      return (
        <p key={index} className={styles.comment}>
          {line.text}
        </p>
      );
    case 'empty':
      return <div key={index} className={styles.emptyLine} />;
    default:
      return null;
  }
}

function renderSection(section: ParsedSection, transpose: number, index: number) {
  const label = section.label ?? SECTION_LABELS[section.type];

  return (
    <section key={index} className={styles.section}>
      {label && <h3 className={styles.sectionLabel}>{label}</h3>}
      {section.lines.map((line, i) => renderLine(line, transpose, i))}
    </section>
  );
}

export function ChordProRenderer({ song, transpose }: ChordProRendererProps) {
  return (
    <div className={styles.renderer}>
      {song.sections.map((section, i) => renderSection(section, transpose, i))}
    </div>
  );
}
