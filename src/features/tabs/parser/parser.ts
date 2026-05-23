import {
  DIRECTIVE_SHORT_FORMS,
  METADATA_FIELDS,
  NUMERIC_METADATA_FIELDS,
  SECTION_END_MAP,
  SECTION_START_MAP,
} from './parser.constants';
import type { ChordLyricPair, ParsedLine, ParsedSection, ParsedSong } from './parser.types';

function tryParseDirective(line: string): { name: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return null;
  }

  const inner = trimmed.slice(1, -1).trim();
  if (inner.length === 0) {
    return null;
  }

  const colonIndex = inner.indexOf(':');
  if (colonIndex === -1) {
    return { name: inner.toLowerCase(), value: '' };
  }

  const name = inner.slice(0, colonIndex).trim().toLowerCase();
  const value = inner.slice(colonIndex + 1).trim();
  return { name, value };
}

function normalizeDirective(name: string): string {
  return DIRECTIVE_SHORT_FORMS[name] ?? name;
}

function parseChordLyricPairs(line: string): ChordLyricPair[] {
  const pairs: ChordLyricPair[] = [];

  if (line.length === 0) {
    pairs.push({ chord: null, lyric: '' });
    return pairs;
  }

  let i = 0;

  if (line[0] !== '[') {
    let leadingText = '';
    while (i < line.length && line[i] !== '[') {
      leadingText += line[i];
      i++;
    }
    pairs.push({ chord: null, lyric: leadingText });
  }

  while (i < line.length) {
    if (line[i] === '[') {
      const openBracket = i;
      i++;

      let closeBracket = -1;
      while (i < line.length) {
        if (line[i] === ']') {
          closeBracket = i;
          break;
        }
        i++;
      }

      if (closeBracket === -1) {
        const literalText = line.slice(openBracket);
        if (pairs.length > 0) {
          pairs[pairs.length - 1].lyric += literalText;
        } else {
          pairs.push({ chord: null, lyric: literalText });
        }
        break;
      }

      const chord = line.slice(openBracket + 1, closeBracket);
      i = closeBracket + 1;

      let lyric = '';
      while (i < line.length && line[i] !== '[') {
        lyric += line[i];
        i++;
      }

      pairs.push({ chord, lyric });
    } else {
      i++;
    }
  }

  return pairs;
}

export function parseChordPro(source: string): ParsedSong {
  const song: ParsedSong = {
    title: null,
    subtitle: null,
    artist: null,
    key: null,
    capo: null,
    tempo: null,
    time: null,
    directives: [],
    sections: [],
  };

  let currentSection: ParsedSection | null = null;
  let inTabBlock = false;

  function addLineToCurrentSection(line: ParsedLine): void {
    if (currentSection === null) {
      currentSection = { type: 'unknown', label: null, lines: [] };
    }
    currentSection.lines.push(line);
  }

  function flushCurrentSection(): void {
    if (currentSection !== null) {
      song.sections.push(currentSection);
      currentSection = null;
      inTabBlock = false;
    }
  }

  const lines = source.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');

    const directive = tryParseDirective(line);

    if (directive !== null) {
      const normalized = normalizeDirective(directive.name);

      song.directives.push({ name: normalized, value: directive.value });

      if (normalized in METADATA_FIELDS) {
        const field = METADATA_FIELDS[normalized];
        if (NUMERIC_METADATA_FIELDS.has(normalized)) {
          const parsed = Number(directive.value);
          const numericField = field as 'capo' | 'tempo';
          song[numericField] = Number.isNaN(parsed) ? null : parsed;
        } else {
          const stringField = field as 'title' | 'subtitle' | 'artist' | 'key' | 'time';
          song[stringField] = directive.value;
        }
        continue;
      }

      if (normalized === 'comment') {
        addLineToCurrentSection({ type: 'comment', text: directive.value });
        continue;
      }

      if (normalized in SECTION_START_MAP) {
        flushCurrentSection();
        currentSection = {
          type: SECTION_START_MAP[normalized],
          label: directive.value || null,
          lines: [],
        };
        if (SECTION_START_MAP[normalized] === 'tab') {
          inTabBlock = true;
        }
        continue;
      }

      if (normalized in SECTION_END_MAP) {
        flushCurrentSection();
        continue;
      }

      continue;
    }

    if (line.trim().length === 0) {
      addLineToCurrentSection({ type: 'empty' });
      continue;
    }

    if (inTabBlock) {
      addLineToCurrentSection({ type: 'tab', text: line });
    } else {
      const pairs = parseChordLyricPairs(line);
      addLineToCurrentSection({ type: 'chord-lyric', pairs });
    }
  }

  flushCurrentSection();

  return song;
}
