import type { ParsedSong, SectionType } from './parser.types';

export const DIRECTIVE_SHORT_FORMS: Record<string, string> = {
  t: 'title',
  st: 'subtitle',
  c: 'comment',
  sov: 'start_of_verse',
  eov: 'end_of_verse',
  soc: 'start_of_chorus',
  eoc: 'end_of_chorus',
  sot: 'start_of_tab',
  eot: 'end_of_tab',
  sob: 'start_of_bridge',
  eob: 'end_of_bridge',
};

export const SECTION_START_MAP: Record<string, SectionType> = {
  start_of_verse: 'verse',
  start_of_chorus: 'chorus',
  start_of_bridge: 'bridge',
  start_of_tab: 'tab',
  start_of_intro: 'intro',
  start_of_outro: 'outro',
  start_of_instrumental: 'instrumental',
};

export const SECTION_END_MAP: Record<string, SectionType> = {
  end_of_verse: 'verse',
  end_of_chorus: 'chorus',
  end_of_bridge: 'bridge',
  end_of_tab: 'tab',
  end_of_intro: 'intro',
  end_of_outro: 'outro',
  end_of_instrumental: 'instrumental',
};

export const METADATA_FIELDS: Record<
  string,
  keyof Pick<ParsedSong, 'title' | 'subtitle' | 'artist' | 'key' | 'capo' | 'tempo' | 'time'>
> = {
  title: 'title',
  subtitle: 'subtitle',
  artist: 'artist',
  key: 'key',
  capo: 'capo',
  tempo: 'tempo',
  time: 'time',
};

export const NUMERIC_METADATA_FIELDS = new Set<string>(['capo', 'tempo']);
