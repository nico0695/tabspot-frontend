export type SectionType =
  | 'verse'
  | 'chorus'
  | 'bridge'
  | 'tab'
  | 'intro'
  | 'outro'
  | 'instrumental'
  | 'unknown';

export interface ParsedDirective {
  name: string;
  value: string;
}

export interface ChordLyricPair {
  chord: string | null;
  lyric: string;
}

export interface ParsedLine {
  type: 'chord-lyric' | 'comment' | 'tab' | 'empty';
  pairs?: ChordLyricPair[];
  text?: string;
}

export interface ParsedSection {
  type: SectionType;
  label: string | null;
  lines: ParsedLine[];
}

export interface ParsedSong {
  title: string | null;
  subtitle: string | null;
  artist: string | null;
  key: string | null;
  capo: number | null;
  tempo: number | null;
  time: string | null;
  directives: ParsedDirective[];
  sections: ParsedSection[];
}
