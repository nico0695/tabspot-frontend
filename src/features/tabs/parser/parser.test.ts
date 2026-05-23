import { describe, it, expect } from 'vitest';
import { parseChordPro } from './parser';

describe('parseChordPro', () => {
  describe('empty / minimal input', () => {
    it('returns a valid ParsedSong with all null metadata and empty directives for an empty string', () => {
      const song = parseChordPro('');
      expect(song.title).toBeNull();
      expect(song.subtitle).toBeNull();
      expect(song.artist).toBeNull();
      expect(song.key).toBeNull();
      expect(song.capo).toBeNull();
      expect(song.tempo).toBeNull();
      expect(song.time).toBeNull();
      expect(song.directives).toEqual([]);
      // splitting '' produces [''], which is one empty line → implicit unknown section
      expect(song.sections).toHaveLength(1);
      expect(song.sections[0].type).toBe('unknown');
      expect(song.sections[0].lines).toHaveLength(1);
      expect(song.sections[0].lines[0].type).toBe('empty');
    });

    it('treats whitespace-only input as an unknown section with empty lines', () => {
      const song = parseChordPro('   \n  \n   ');
      expect(song.sections).toHaveLength(1);
      expect(song.sections[0].type).toBe('unknown');
      expect(song.sections[0].lines.every((l) => l.type === 'empty')).toBe(true);
    });
  });

  describe('metadata directives', () => {
    it('parses {title: Amazing Grace}', () => {
      const song = parseChordPro('{title: Amazing Grace}');
      expect(song.title).toBe('Amazing Grace');
    });

    it('parses short form {t: Short Title}', () => {
      const song = parseChordPro('{t: Short Title}');
      expect(song.title).toBe('Short Title');
    });

    it('parses {subtitle: Traditional}', () => {
      const song = parseChordPro('{subtitle: Traditional}');
      expect(song.subtitle).toBe('Traditional');
    });

    it('parses short form {st: Alt Sub}', () => {
      const song = parseChordPro('{st: Alt Sub}');
      expect(song.subtitle).toBe('Alt Sub');
    });

    it('parses {artist: John Newton}', () => {
      const song = parseChordPro('{artist: John Newton}');
      expect(song.artist).toBe('John Newton');
    });

    it('parses {key: G}', () => {
      const song = parseChordPro('{key: G}');
      expect(song.key).toBe('G');
    });

    it('parses {capo: 3} as a number', () => {
      const song = parseChordPro('{capo: 3}');
      expect(song.capo).toBe(3);
    });

    it('parses {capo: abc} as null (non-numeric)', () => {
      const song = parseChordPro('{capo: abc}');
      expect(song.capo).toBeNull();
    });

    it('parses {tempo: 120} as a number', () => {
      const song = parseChordPro('{tempo: 120}');
      expect(song.tempo).toBe(120);
    });

    it('parses {time: 4/4} as a string', () => {
      const song = parseChordPro('{time: 4/4}');
      expect(song.time).toBe('4/4');
    });

    it('handles case-insensitive directives: {Title: Foo}', () => {
      const song = parseChordPro('{Title: Foo}');
      expect(song.title).toBe('Foo');
    });

    it('handles case-insensitive directives: {TITLE: Bar}', () => {
      const song = parseChordPro('{TITLE: Bar}');
      expect(song.title).toBe('Bar');
    });

    it('stores all metadata directives in song.directives[]', () => {
      const song = parseChordPro('{title: Foo}\n{artist: Bar}\n{key: C}\n{capo: 2}');
      expect(song.directives).toHaveLength(4);
      expect(song.directives[0]).toEqual({ name: 'title', value: 'Foo' });
      expect(song.directives[1]).toEqual({ name: 'artist', value: 'Bar' });
      expect(song.directives[2]).toEqual({ name: 'key', value: 'C' });
      expect(song.directives[3]).toEqual({ name: 'capo', value: '2' });
    });
  });

  describe('sections', () => {
    it('parses a multi-section song with verse, chorus, bridge, and tab', () => {
      const source = [
        '{start_of_verse}',
        '[G]Hello',
        '{end_of_verse}',
        '{start_of_chorus}',
        '[C]Sing along',
        '{end_of_chorus}',
        '{start_of_bridge}',
        '[Am]Bridge part',
        '{end_of_bridge}',
        '{start_of_tab}',
        'e|---0---|',
        '{end_of_tab}',
      ].join('\n');

      const song = parseChordPro(source);
      expect(song.sections).toHaveLength(4);
      expect(song.sections[0].type).toBe('verse');
      expect(song.sections[1].type).toBe('chorus');
      expect(song.sections[2].type).toBe('bridge');
      expect(song.sections[3].type).toBe('tab');
    });

    it('parses section labels: {start_of_verse: Verse 1}', () => {
      const song = parseChordPro('{start_of_verse: Verse 1}\n[G]Line\n{end_of_verse}');
      expect(song.sections[0].label).toBe('Verse 1');
    });

    it('places content outside any section into an implicit unknown section', () => {
      const song = parseChordPro('[G]Hello world');
      expect(song.sections).toHaveLength(1);
      expect(song.sections[0].type).toBe('unknown');
      expect(song.sections[0].lines).toHaveLength(1);
      expect(song.sections[0].lines[0].type).toBe('chord-lyric');
    });

    it('auto-closes previous section when a new start_of_* appears', () => {
      const source = [
        '{start_of_verse}',
        '[G]Verse line',
        '{start_of_chorus}',
        '[C]Chorus line',
        '{end_of_chorus}',
      ].join('\n');

      const song = parseChordPro(source);
      expect(song.sections).toHaveLength(2);
      expect(song.sections[0].type).toBe('verse');
      expect(song.sections[0].lines).toHaveLength(1);
      expect(song.sections[1].type).toBe('chorus');
      expect(song.sections[1].lines).toHaveLength(1);
    });

    it('silently ignores unmatched end_of_* (no crash)', () => {
      const song = parseChordPro('{end_of_verse}');
      expect(song.sections).toHaveLength(0);
    });

    it('auto-closes an open section at end-of-input', () => {
      const source = '{start_of_verse}\n[G]Hello';
      const song = parseChordPro(source);
      expect(song.sections).toHaveLength(1);
      expect(song.sections[0].type).toBe('verse');
      expect(song.sections[0].lines).toHaveLength(1);
    });

    it('handles short-form section directives: {sov}, {soc}, {sot}, {sob}', () => {
      const source = [
        '{sov}',
        '[G]Verse',
        '{eov}',
        '{soc}',
        '[C]Chorus',
        '{eoc}',
        '{sot}',
        'e|---0---|',
        '{eot}',
        '{sob}',
        '[Am]Bridge',
        '{eob}',
      ].join('\n');

      const song = parseChordPro(source);
      expect(song.sections).toHaveLength(4);
      expect(song.sections[0].type).toBe('verse');
      expect(song.sections[1].type).toBe('chorus');
      expect(song.sections[2].type).toBe('tab');
      expect(song.sections[3].type).toBe('bridge');
    });
  });

  describe('chord-lyric parsing', () => {
    it('parses [Am]Hello [G]world into chord-lyric pairs', () => {
      const song = parseChordPro('[Am]Hello [G]world');
      const line = song.sections[0].lines[0];
      expect(line.type).toBe('chord-lyric');
      expect(line.pairs).toHaveLength(2);
      expect(line.pairs![0]).toEqual({ chord: 'Am', lyric: 'Hello ' });
      expect(line.pairs![1]).toEqual({ chord: 'G', lyric: 'world' });
    });

    it('parses complex chords: C#m7, Bb, Dsus4, G/B, Fmaj7', () => {
      const song = parseChordPro('[C#m7]a [Bb]b [Dsus4]c [G/B]d [Fmaj7]e');
      const pairs = song.sections[0].lines[0].pairs!;
      expect(pairs).toHaveLength(5);
      expect(pairs[0].chord).toBe('C#m7');
      expect(pairs[1].chord).toBe('Bb');
      expect(pairs[2].chord).toBe('Dsus4');
      expect(pairs[3].chord).toBe('G/B');
      expect(pairs[4].chord).toBe('Fmaj7');
    });

    it('parses consecutive chords with no trailing text: [G][C][D]', () => {
      const song = parseChordPro('[G][C][D]');
      const pairs = song.sections[0].lines[0].pairs!;
      expect(pairs).toHaveLength(3);
      expect(pairs[0]).toEqual({ chord: 'G', lyric: '' });
      expect(pairs[1]).toEqual({ chord: 'C', lyric: '' });
      expect(pairs[2]).toEqual({ chord: 'D', lyric: '' });
    });

    it('handles text before the first chord: "Hello [Am]world"', () => {
      const song = parseChordPro('Hello [Am]world');
      const pairs = song.sections[0].lines[0].pairs!;
      expect(pairs).toHaveLength(2);
      expect(pairs[0]).toEqual({ chord: null, lyric: 'Hello ' });
      expect(pairs[1]).toEqual({ chord: 'Am', lyric: 'world' });
    });

    it('handles consecutive chords with spaces: [G] [C] [D]', () => {
      const song = parseChordPro('[G] [C] [D]');
      const pairs = song.sections[0].lines[0].pairs!;
      expect(pairs).toHaveLength(3);
      expect(pairs[0]).toEqual({ chord: 'G', lyric: ' ' });
      expect(pairs[1]).toEqual({ chord: 'C', lyric: ' ' });
      expect(pairs[2]).toEqual({ chord: 'D', lyric: '' });
    });

    it('handles a line with only text and no chords', () => {
      const song = parseChordPro('Just lyrics');
      const pairs = song.sections[0].lines[0].pairs!;
      expect(pairs).toHaveLength(1);
      expect(pairs[0]).toEqual({ chord: null, lyric: 'Just lyrics' });
    });
  });

  describe('tab blocks', () => {
    it('preserves raw text inside tab blocks without chord parsing', () => {
      const source = [
        '{start_of_tab}',
        'e|---0---2---3---|',
        'B|---1---3---0---|',
        '{end_of_tab}',
      ].join('\n');

      const song = parseChordPro(source);
      expect(song.sections).toHaveLength(1);
      expect(song.sections[0].type).toBe('tab');

      const lines = song.sections[0].lines;
      expect(lines).toHaveLength(2);
      expect(lines[0].type).toBe('tab');
      expect(lines[0].text).toBe('e|---0---2---3---|');
      expect(lines[1].type).toBe('tab');
      expect(lines[1].text).toBe('B|---1---3---0---|');
    });

    it('does not parse brackets as chords inside tab blocks', () => {
      const source = ['{start_of_tab}', '[Am] is not a chord here', '{end_of_tab}'].join('\n');

      const song = parseChordPro(source);
      const line = song.sections[0].lines[0];
      expect(line.type).toBe('tab');
      expect(line.text).toBe('[Am] is not a chord here');
      expect(line.pairs).toBeUndefined();
    });
  });

  describe('comments', () => {
    it('parses {comment: Instrumental break}', () => {
      const song = parseChordPro('{comment: Instrumental break}');
      expect(song.sections).toHaveLength(1);
      const line = song.sections[0].lines[0];
      expect(line.type).toBe('comment');
      expect(line.text).toBe('Instrumental break');
    });

    it('parses short form {c: Short comment}', () => {
      const song = parseChordPro('{c: Short comment}');
      const line = song.sections[0].lines[0];
      expect(line.type).toBe('comment');
      expect(line.text).toBe('Short comment');
    });
  });

  describe('empty lines', () => {
    it('parses blank lines as type empty', () => {
      const song = parseChordPro('[G]Hello\n\n[C]World');
      const lines = song.sections[0].lines;
      expect(lines).toHaveLength(3);
      expect(lines[1].type).toBe('empty');
    });

    it('preserves multiple consecutive empty lines', () => {
      const song = parseChordPro('[G]Hello\n\n\n\n[C]World');
      const lines = song.sections[0].lines;
      expect(lines).toHaveLength(5);
      expect(lines[1].type).toBe('empty');
      expect(lines[2].type).toBe('empty');
      expect(lines[3].type).toBe('empty');
    });
  });

  describe('edge cases', () => {
    it('treats an unclosed bracket [Am as literal text without crashing', () => {
      const song = parseChordPro('[Am');
      const pairs = song.sections[0].lines[0].pairs!;
      expect(pairs).toHaveLength(1);
      expect(pairs[0]).toEqual({ chord: null, lyric: '[Am' });
    });

    it('appends unclosed bracket text to previous pair: "hello [Am"', () => {
      const song = parseChordPro('hello [Am');
      const pairs = song.sections[0].lines[0].pairs!;
      expect(pairs).toHaveLength(1);
      expect(pairs[0]).toEqual({ chord: null, lyric: 'hello [Am' });
    });

    it('stores unrecognized directives in directives[] without crashing', () => {
      const song = parseChordPro('{custom: value}');
      expect(song.directives).toHaveLength(1);
      expect(song.directives[0]).toEqual({ name: 'custom', value: 'value' });
    });

    it('handles \\r\\n line endings the same as \\n', () => {
      const song = parseChordPro('{title: Test}\r\n[G]Hello\r\n[C]World');
      expect(song.title).toBe('Test');
      expect(song.sections).toHaveLength(1);
      expect(song.sections[0].lines).toHaveLength(2);
    });

    it('handles directive with no value: {title} sets title to empty string', () => {
      const song = parseChordPro('{title}');
      expect(song.title).toBe('');
    });

    it('ignores empty directive {} (tryParseDirective returns null, treated as content)', () => {
      const song = parseChordPro('{}');
      expect(song.directives).toHaveLength(0);
      // {} is not parsed as a directive (empty inner), so it falls through
      // to chord-lyric parsing, creating an implicit unknown section
      expect(song.sections).toHaveLength(1);
      expect(song.sections[0].type).toBe('unknown');
      expect(song.sections[0].lines[0].type).toBe('chord-lyric');
    });
  });

  describe('integration', () => {
    it('parses a full realistic Amazing Grace song', () => {
      const source = [
        '{title: Amazing Grace}',
        '{artist: John Newton}',
        '{key: G}',
        '{capo: 2}',
        '{tempo: 80}',
        '{time: 3/4}',
        '',
        '{start_of_verse: Verse 1}',
        '[G]Amazing [G/B]grace, how [C]sweet the [G]sound,',
        '[Em]That saved a [D]wretch like [G]me!',
        "[G]I once was [G/B]lost, but [C]now I'm [G]found,",
        '[Em]Was blind, but [D]now I [G]see.',
        '{end_of_verse}',
        '',
        '{start_of_chorus}',
        '{comment: Sing together}',
        '[C]How precious [G]did that [Em]grace [D]appear,',
        '[G]The hour I [C]first be[G]lieved.',
        '{end_of_chorus}',
        '',
        '{start_of_tab}',
        'e|---3---2---0---|',
        'B|---0---3---1---|',
        'G|---0---2---0---|',
        '{end_of_tab}',
        '',
        '{start_of_bridge: Bridge}',
        '[Am]Through many [D]dangers, [G]toils and [Em]snares,',
        '[Am]I have al[D]ready [G]come.',
        '{end_of_bridge}',
      ].join('\n');

      const song = parseChordPro(source);

      // Metadata
      expect(song.title).toBe('Amazing Grace');
      expect(song.artist).toBe('John Newton');
      expect(song.key).toBe('G');
      expect(song.capo).toBe(2);
      expect(song.tempo).toBe(80);
      expect(song.time).toBe('3/4');
      expect(song.subtitle).toBeNull();

      // Directives: 6 metadata + 4 section starts + 4 section ends + 1 comment = 15
      expect(song.directives).toHaveLength(15);

      // Sections: verse, chorus, tab, bridge (empty lines between sections create an unknown section)
      // Let's check: after end_of_verse there's a blank line before start_of_chorus.
      // That blank line is outside any section, so it creates an implicit unknown section.
      // Same between chorus and tab, and between tab and bridge.
      expect(song.sections.length).toBeGreaterThanOrEqual(4);

      // Find the named sections
      const verse = song.sections.find((s) => s.type === 'verse');
      const chorus = song.sections.find((s) => s.type === 'chorus');
      const tab = song.sections.find((s) => s.type === 'tab');
      const bridge = song.sections.find((s) => s.type === 'bridge');

      expect(verse).toBeDefined();
      expect(verse!.label).toBe('Verse 1');
      expect(verse!.lines).toHaveLength(4);
      expect(verse!.lines[0].type).toBe('chord-lyric');
      expect(verse!.lines[0].pairs![0]).toEqual({ chord: 'G', lyric: 'Amazing ' });
      expect(verse!.lines[0].pairs![1]).toEqual({ chord: 'G/B', lyric: 'grace, how ' });

      expect(chorus).toBeDefined();
      expect(chorus!.label).toBeNull();
      expect(chorus!.lines).toHaveLength(3); // comment + 2 chord-lyric lines
      expect(chorus!.lines[0].type).toBe('comment');
      expect(chorus!.lines[0].text).toBe('Sing together');

      expect(tab).toBeDefined();
      expect(tab!.lines).toHaveLength(3);
      expect(tab!.lines[0].type).toBe('tab');
      expect(tab!.lines[0].text).toBe('e|---3---2---0---|');

      expect(bridge).toBeDefined();
      expect(bridge!.label).toBe('Bridge');
      expect(bridge!.lines).toHaveLength(2);
      expect(bridge!.lines[0].pairs![0]).toEqual({ chord: 'Am', lyric: 'Through many ' });
    });
  });
});
