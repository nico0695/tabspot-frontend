import { describe, expect, test } from 'vitest';
import { Difficulty, Instrument, TabStatus, TabType } from '@/lib/api/enums';
import type { RawImportFile } from '../import.types';
import { createStubParser } from './importParser.stub';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFile(relativePath: string, kind: 'cho' | 'chor' | 'log' = 'cho'): RawImportFile {
  const fileName = relativePath.split('/').pop() ?? relativePath;
  return {
    relativePath,
    fileName,
    kind,
    file: new File(['x'], fileName),
  };
}

const DEFAULT_META = {
  artist: { id: 'art-1', name: 'Almafuerte', sortName: 'Almafuerte' },
  defaults: {
    status: TabStatus.DRAFT,
    difficulty: Difficulty.INTERMEDIATE,
    instrument: Instrument.GUITAR,
  },
  maxVersions: 10,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('createStubParser — ImportVersionRecord contract (IU-06, IU-12)', () => {
  test('returns records with all required fields present and typed correctly', async () => {
    const parser = createStubParser();
    const files = [makeFile('artist/song-a/song-a.cho')];
    const { records, summary } = await parser.parse(files, DEFAULT_META);

    expect(records).toHaveLength(1);
    const r = records[0];

    // id: non-empty string
    expect(typeof r.id).toBe('string');
    expect(r.id.length).toBeGreaterThan(0);

    // songKey: non-empty string
    expect(typeof r.songKey).toBe('string');
    expect(r.songKey.length).toBeGreaterThan(0);

    // songTitle: non-empty string
    expect(typeof r.songTitle).toBe('string');
    expect(r.songTitle.length).toBeGreaterThan(0);

    // fileName: non-empty string
    expect(typeof r.fileName).toBe('string');
    expect(r.fileName).toBe('song-a.cho');

    // relativePath: mirrors input
    expect(r.relativePath).toBe('artist/song-a/song-a.cho');

    // versionLabel: v1 format
    expect(r.versionLabel).toBe('v1');
    expect(r.versionNumber).toBe(1);

    // title same as songTitle (stub)
    expect(r.title).toBe(r.songTitle);

    // detectedArtist: null (stub never parses)
    expect(r.detectedArtist).toBeNull();

    // tabType: valid enum value
    const validTabTypes: TabType[] = [TabType.CHORDS, TabType.TAB, TabType.MIXED];
    expect(validTabTypes).toContain(r.tabType);

    // instrument / difficulty / targetStatus from meta.defaults
    expect(r.instrument).toBe(Instrument.GUITAR);
    expect(r.difficulty).toBe(Difficulty.INTERMEDIATE);
    expect(r.targetStatus).toBe(TabStatus.DRAFT);

    // status: valid ImportVersionStatus
    expect(['ready', 'review', 'discard']).toContain(r.status);

    // rawContent: always empty string
    expect(r.rawContent).toBe('');

    // warnings: array
    expect(Array.isArray(r.warnings)).toBe(true);

    // summary totals match
    expect(summary.total).toBe(1);
    expect(summary[r.status]).toBe(1);
  });

  test('index-based status distribution is deterministic for N=7 files', async () => {
    const parser = createStubParser();
    // Use 7 files under distinct song folders, sorted alphab. by relativePath
    const files = [
      makeFile('artist/song-a/v.cho'), // i=0 → ready
      makeFile('artist/song-b/v.cho'), // i=1 → ready
      makeFile('artist/song-c/v.cho'), // i=2 → review
      makeFile('artist/song-d/v.cho'), // i=3 → ready
      makeFile('artist/song-e/v.cho'), // i=4 → ready
      makeFile('artist/song-f/v.cho'), // i=5 → review
      makeFile('artist/song-g/v.cho'), // i=6 → discard
    ];

    const { records } = await parser.parse(files, DEFAULT_META);
    expect(records).toHaveLength(7);

    expect(records[0].status).toBe('ready'); // 0 % 7 ≠ 6, 0 % 3 ≠ 2
    expect(records[1].status).toBe('ready'); // 1 % 7 ≠ 6, 1 % 3 ≠ 2
    expect(records[2].status).toBe('review'); // 2 % 3 === 2
    expect(records[3].status).toBe('ready'); // 3 % 7 ≠ 6, 3 % 3 ≠ 2
    expect(records[4].status).toBe('ready'); // 4 % 7 ≠ 6, 4 % 3 ≠ 2
    expect(records[5].status).toBe('review'); // 5 % 3 === 2
    expect(records[6].status).toBe('discard'); // 6 % 7 === 6 (discard takes precedence)
  });

  test('discard record gets no-content warning', async () => {
    const parser = createStubParser();
    // Need 7 files so index 6 exists
    const files = Array.from({ length: 7 }, (_, i) =>
      makeFile(`artist/song-${String.fromCharCode(97 + i)}/v.cho`),
    );
    const { records } = await parser.parse(files, DEFAULT_META);
    const discarded = records[6];
    expect(discarded.status).toBe('discard');
    expect(discarded.warnings.some((w) => w.code === 'no-content')).toBe(true);
  });

  test('review record gets title-fallback warning', async () => {
    const parser = createStubParser();
    // 3 files: index 2 → review
    const files = [
      makeFile('artist/song-a/v.cho'),
      makeFile('artist/song-b/v.cho'),
      makeFile('artist/song-c/v.cho'),
    ];
    const { records } = await parser.parse(files, DEFAULT_META);
    const reviewed = records[2];
    expect(reviewed.status).toBe('review');
    expect(reviewed.warnings.some((w) => w.code === 'title-fallback')).toBe(true);
  });

  test('.log files in input are ignored — not counted as versions', async () => {
    const parser = createStubParser();
    const files = [
      makeFile('artist/song-a/v.cho'),
      makeFile('artist/song-a/import.log', 'log'),
      makeFile('artist/song-b/v.cho'),
    ];
    const { records, summary } = await parser.parse(files, DEFAULT_META);
    // Only 2 records (the .cho files); .log excluded
    expect(records).toHaveLength(2);
    expect(summary.total).toBe(2);
    // None of the records has a .log extension
    for (const r of records) {
      expect(r.fileName.endsWith('.log')).toBe(false);
    }
  });

  test('versionLabel and versionNumber assigned per-songKey in relativePath order', async () => {
    const parser = createStubParser();
    const files = [
      makeFile('artist/my-song/v2.cho'),
      makeFile('artist/my-song/v1.cho'),
      makeFile('artist/other-song/v1.cho'),
    ];
    const { records } = await parser.parse(files, DEFAULT_META);
    // sorted: my-song/v1, my-song/v2, other-song/v1
    const mySong = records.filter((r) => r.songKey === 'my-song');
    expect(mySong).toHaveLength(2);
    expect(mySong[0].versionNumber).toBe(1);
    expect(mySong[0].versionLabel).toBe('v1');
    expect(mySong[1].versionNumber).toBe(2);
    expect(mySong[1].versionLabel).toBe('v2');

    const otherSong = records.filter((r) => r.songKey === 'other-song');
    expect(otherSong).toHaveLength(1);
    expect(otherSong[0].versionNumber).toBe(1);
    expect(otherSong[0].versionLabel).toBe('v1');
  });

  test('summary totals match the records status counts exactly', async () => {
    const parser = createStubParser();
    const files = Array.from({ length: 7 }, (_, i) =>
      makeFile(`artist/song-${String.fromCharCode(97 + i)}/v.cho`),
    );
    const { records, summary } = await parser.parse(files, DEFAULT_META);

    let ready = 0;
    let review = 0;
    let discard = 0;
    for (const r of records) {
      if (r.status === 'ready') ready++;
      else if (r.status === 'review') review++;
      else if (r.status === 'discard') discard++;
    }

    expect(summary.total).toBe(records.length);
    expect(summary.ready).toBe(ready);
    expect(summary.review).toBe(review);
    expect(summary.discard).toBe(discard);
  });

  test('calling parse twice with the same input produces the same status distribution', async () => {
    const parser = createStubParser();
    const files = [
      makeFile('artist/song-a/v.cho'),
      makeFile('artist/song-b/v.cho'),
      makeFile('artist/song-c/v.cho'),
    ];

    const first = await parser.parse(files, DEFAULT_META);
    const second = await parser.parse(files, DEFAULT_META);

    expect(first.records.map((r) => r.status)).toEqual(second.records.map((r) => r.status));
    expect(first.summary).toEqual(second.summary);
  });

  test('tabType cycles through CHORDS, TAB, MIXED by index', async () => {
    const parser = createStubParser();
    const files = [
      makeFile('artist/song-a/v.cho'),
      makeFile('artist/song-b/v.cho'),
      makeFile('artist/song-c/v.cho'),
    ];
    const { records } = await parser.parse(files, DEFAULT_META);
    expect(records[0].tabType).toBe(TabType.CHORDS);
    expect(records[1].tabType).toBe(TabType.TAB);
    expect(records[2].tabType).toBe(TabType.MIXED);
  });

  test('rawContent is always empty string', async () => {
    const parser = createStubParser();
    const files = [makeFile('artist/song-a/v.cho'), makeFile('artist/song-b/v.cho')];
    const { records } = await parser.parse(files, DEFAULT_META);
    for (const r of records) {
      expect(r.rawContent).toBe('');
    }
  });

  test('empty input returns empty records and zero summary', async () => {
    const parser = createStubParser();
    const { records, summary } = await parser.parse([], DEFAULT_META);
    expect(records).toHaveLength(0);
    expect(summary).toEqual({ total: 0, ready: 0, review: 0, discard: 0 });
  });
});
