import type { RawFileKind, RawImportFile, IntakeAdapter } from '../import.types';
import { FolderAdapter } from './folderAdapter';
import { LooseAdapter } from './looseAdapter';

export function classifyKind(fileName: string): RawFileKind {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.chor')) return 'chor';
  if (lower.endsWith('.cho')) return 'cho';
  if (lower.endsWith('.log')) return 'log';
  return 'unknown';
}

export function filterFiles(files: RawImportFile[]): {
  accepted: RawImportFile[];
  rejected: { fileName: string; relativePath: string; reason: string }[];
} {
  const accepted: RawImportFile[] = [];
  const rejected: { fileName: string; relativePath: string; reason: string }[] = [];
  for (const f of files) {
    if (f.kind !== 'unknown') {
      accepted.push(f);
    } else {
      const ext = f.fileName.includes('.')
        ? f.fileName.slice(f.fileName.lastIndexOf('.'))
        : '(sin extensión)';
      rejected.push({
        fileName: f.fileName,
        relativePath: f.relativePath,
        reason: `Extensión no soportada: ${ext}`,
      });
    }
  }
  return { accepted, rejected };
}

// Folder file → immediate parent dir name; loose file → basename minus extension and trailing -N.
export function deriveSongKey(relativePath: string): string {
  const parts = relativePath.split('/');
  if (parts.length >= 2) return parts[parts.length - 2];
  const base = parts[0].replace(/\.[^.]+$/, '');
  return base.replace(/-\d+$/, '');
}

// .log files are enrichment and do not count toward the version limit.
export function findOverLimitSongs(
  files: RawImportFile[],
  maxVersions: number,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const f of files) {
    if (f.kind !== 'cho' && f.kind !== 'chor') continue;
    const key = deriveSongKey(f.relativePath);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const overLimit = new Map<string, number>();
  for (const [key, count] of counts) {
    if (count > maxVersions) overLimit.set(key, count);
  }
  return overLimit;
}

export const folderAdapter: IntakeAdapter = new FolderAdapter();
export const looseAdapter: IntakeAdapter = new LooseAdapter();
