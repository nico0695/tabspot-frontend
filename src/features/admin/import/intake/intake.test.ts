import { describe, expect, test } from 'vitest';
import type { RawImportFile } from '../import.types';
import { classifyKind, filterFiles, deriveSongKey, findOverLimitSongs } from './index';
import { looseAdapter } from './index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a FileList-like object from an array of Files.
 * FileList is not directly constructable in test environments.
 */
function makeFileList(files: File[]): FileList {
  const obj: Record<number, File> & { length: number; item: (i: number) => File | null } = {
    length: files.length,
    item: (i: number) => files[i] ?? null,
  };
  files.forEach((f, i) => {
    obj[i] = f;
  });
  return obj as unknown as FileList;
}

function makeRawFile(relativePath: string, kind: RawImportFile['kind'] = 'cho'): RawImportFile {
  const fileName = relativePath.split('/').pop()!;
  return {
    relativePath,
    fileName,
    kind,
    file: new File([''], fileName),
  };
}

// ---------------------------------------------------------------------------
// classifyKind
// ---------------------------------------------------------------------------

describe('classifyKind', () => {
  test('.cho → cho', () => {
    expect(classifyKind('song.cho')).toBe('cho');
  });

  test('.CHO (uppercase) → cho', () => {
    expect(classifyKind('SONG.CHO')).toBe('cho');
  });

  test('.chor → chor', () => {
    expect(classifyKind('song.chor')).toBe('chor');
  });

  test('.CHOR (uppercase) → chor', () => {
    expect(classifyKind('SONG.CHOR')).toBe('chor');
  });

  test('.log → log', () => {
    expect(classifyKind('session.log')).toBe('log');
  });

  test('.txt → unknown', () => {
    expect(classifyKind('notes.txt')).toBe('unknown');
  });

  test('.zip → unknown', () => {
    expect(classifyKind('archive.zip')).toBe('unknown');
  });

  test('no extension → unknown', () => {
    expect(classifyKind('README')).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// filterFiles
// ---------------------------------------------------------------------------

describe('filterFiles', () => {
  test('accepted set excludes unknown kinds', () => {
    const files: RawImportFile[] = [
      makeRawFile('almafuerte/cosas/cosas.cho', 'cho'),
      makeRawFile('almafuerte/cosas/cosas.chor', 'chor'),
      makeRawFile('almafuerte/cosas/notes.txt', 'unknown'),
      makeRawFile('almafuerte/cosas/session.log', 'log'),
    ];
    const { accepted } = filterFiles(files);
    expect(accepted).toHaveLength(3);
    expect(accepted.map((f) => f.fileName)).not.toContain('notes.txt');
  });

  test('rejected list contains unknown files with a reason string', () => {
    const files: RawImportFile[] = [
      makeRawFile('song.cho', 'cho'),
      makeRawFile('archive.zip', 'unknown'),
      makeRawFile('image.png', 'unknown'),
    ];
    const { rejected } = filterFiles(files);
    expect(rejected).toHaveLength(2);
    for (const r of rejected) {
      expect(typeof r.reason).toBe('string');
      expect(r.reason.length).toBeGreaterThan(0);
    }
    expect(rejected.map((r) => r.fileName)).toContain('archive.zip');
    expect(rejected.map((r) => r.fileName)).toContain('image.png');
  });

  test('returns empty rejected when all files are accepted', () => {
    const files: RawImportFile[] = [makeRawFile('a.cho', 'cho'), makeRawFile('b.chor', 'chor')];
    const { rejected } = filterFiles(files);
    expect(rejected).toHaveLength(0);
  });

  test('returns empty accepted when all files are unknown', () => {
    const files: RawImportFile[] = [makeRawFile('a.txt', 'unknown')];
    const { accepted } = filterFiles(files);
    expect(accepted).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// looseAdapter.collect
// ---------------------------------------------------------------------------

describe('looseAdapter.collect', () => {
  test('relativePath equals fileName for each file', async () => {
    const files = [new File([''], 'song.cho'), new File([''], 'song.chor')];
    const fileList = makeFileList(files);
    const result = await looseAdapter.collect(fileList);

    expect(result).toHaveLength(2);
    for (const r of result) {
      expect(r.relativePath).toBe(r.fileName);
    }
  });

  test('kind is classified correctly', async () => {
    const files = [
      new File([''], 'song.cho'),
      new File([''], 'song.chor'),
      new File([''], 'session.log'),
      new File([''], 'notes.txt'),
    ];
    const fileList = makeFileList(files);
    const result = await looseAdapter.collect(fileList);

    expect(result.find((r) => r.fileName === 'song.cho')?.kind).toBe('cho');
    expect(result.find((r) => r.fileName === 'song.chor')?.kind).toBe('chor');
    expect(result.find((r) => r.fileName === 'session.log')?.kind).toBe('log');
    expect(result.find((r) => r.fileName === 'notes.txt')?.kind).toBe('unknown');
  });

  test('handles empty FileList', async () => {
    const fileList = makeFileList([]);
    const result = await looseAdapter.collect(fileList);
    expect(result).toHaveLength(0);
  });

  test('accepts DataTransfer.files path', async () => {
    // DataTransfer is not available in happy-dom; simulate with a files-like object
    const files = [new File([''], 'song.cho')];
    const fileList = makeFileList(files);
    // Cast a minimal DataTransfer-like to DataTransfer to exercise the branch
    const fakeDt = { files: fileList } as unknown as DataTransfer;
    const result = await looseAdapter.collect(fakeDt);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('cho');
  });
});

// ---------------------------------------------------------------------------
// folderAdapter (drag path via webkitGetAsEntry)
// ---------------------------------------------------------------------------

// NOTE: The folderAdapter drag path (DataTransfer + webkitGetAsEntry / FileSystem
// Access API) cannot be reliably simulated in happy-dom because the environment
// does not expose FileSystemDirectoryEntry / FileSystemFileEntry.
// That code path is intentionally skipped here and should be covered by
// manual browser testing or a Playwright/Cypress integration test.

// ---------------------------------------------------------------------------
// deriveSongKey
// ---------------------------------------------------------------------------

describe('deriveSongKey', () => {
  test('directory path with two segments: returns immediate parent dir name', () => {
    expect(deriveSongKey('almafuerte/cosas/cosas.cho')).toBe('cosas');
  });

  test('directory path with trailing -2 version: still returns parent dir name', () => {
    expect(deriveSongKey('almafuerte/cosas/cosas-2.cho')).toBe('cosas');
  });

  test('loose file without suffix: strips extension', () => {
    expect(deriveSongKey('song.cho')).toBe('song');
  });

  test('loose file with numeric suffix: strips -N and extension', () => {
    expect(deriveSongKey('song-3.cho')).toBe('song');
  });

  test('loose file with double-digit suffix', () => {
    expect(deriveSongKey('ballad-12.chor')).toBe('ballad');
  });

  test('file inside a single-level subdirectory', () => {
    expect(deriveSongKey('cosas/cosas.cho')).toBe('cosas');
  });

  test('deeply nested path: returns immediate parent', () => {
    expect(deriveSongKey('a/b/c/d.cho')).toBe('c');
  });
});

// ---------------------------------------------------------------------------
// findOverLimitSongs
// ---------------------------------------------------------------------------

describe('findOverLimitSongs', () => {
  test('returns song keys where version count exceeds maxVersions', () => {
    const files: RawImportFile[] = [
      makeRawFile('artist/song-a/song-a.cho', 'cho'),
      makeRawFile('artist/song-a/song-a-2.cho', 'cho'),
      makeRawFile('artist/song-a/song-a-3.cho', 'cho'), // 3 > 2
      makeRawFile('artist/song-b/song-b.cho', 'cho'),
      makeRawFile('artist/song-b/song-b-2.cho', 'cho'), // 2 == 2, not over
    ];
    const overLimit = findOverLimitSongs(files, 2);
    expect(overLimit.has('song-a')).toBe(true);
    expect(overLimit.get('song-a')).toBe(3);
    expect(overLimit.has('song-b')).toBe(false);
  });

  test('.log files do not count toward version limit', () => {
    const files: RawImportFile[] = [
      makeRawFile('artist/song-a/song-a.cho', 'cho'),
      makeRawFile('artist/song-a/song-a.log', 'log'), // enrichment only
      makeRawFile('artist/song-a/song-a.log', 'log'), // enrichment only
    ];
    const overLimit = findOverLimitSongs(files, 2);
    // only 1 importable version → not over limit
    expect(overLimit.has('song-a')).toBe(false);
  });

  test('returns empty map when all songs are within limit', () => {
    const files: RawImportFile[] = [
      makeRawFile('artist/song-a/v1.cho', 'cho'),
      makeRawFile('artist/song-b/v1.chor', 'chor'),
    ];
    const overLimit = findOverLimitSongs(files, 3);
    expect(overLimit.size).toBe(0);
  });

  test('counts .chor as an importable version', () => {
    const files: RawImportFile[] = [
      makeRawFile('artist/song-x/song-x.cho', 'cho'),
      makeRawFile('artist/song-x/song-x-2.chor', 'chor'),
      makeRawFile('artist/song-x/song-x-3.cho', 'cho'), // 3 > 1
    ];
    const overLimit = findOverLimitSongs(files, 1);
    expect(overLimit.has('song-x')).toBe(true);
    expect(overLimit.get('song-x')).toBe(3);
  });

  test('returns empty map for empty file list', () => {
    expect(findOverLimitSongs([], 5).size).toBe(0);
  });
});
