import { TabType } from '@/lib/api/enums';
import { deriveSongKey } from '../intake/index';
import type {
  ImportParser,
  ImportParseOutput,
  ImportSessionMeta,
  ImportSummary,
  ImportVersionRecord,
  ImportWarning,
  RawImportFile,
} from '../import.types';

const TAB_TYPE_CYCLE: TabType[] = [TabType.CHORDS, TabType.TAB, TabType.MIXED];

function humanizeSongKey(songKey: string): string {
  return songKey.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function createStubParser(): ImportParser {
  return {
    async parse(files: RawImportFile[], meta: ImportSessionMeta): Promise<ImportParseOutput> {
      const importable = files.filter((f) => f.kind === 'cho' || f.kind === 'chor');

      const sorted = [...importable].sort((a, b) => a.relativePath.localeCompare(b.relativePath));

      const versionCounts = new Map<string, number>();
      for (const file of sorted) {
        const key = deriveSongKey(file.relativePath);
        versionCounts.set(key, (versionCounts.get(key) ?? 0) + 1);
      }

      const versionIndexes = new Map<string, number>();
      const records: ImportVersionRecord[] = [];

      for (let i = 0; i < sorted.length; i++) {
        const file = sorted[i];
        const songKey = deriveSongKey(file.relativePath);
        const songTitle = humanizeSongKey(songKey);

        const vIdx = (versionIndexes.get(songKey) ?? 0) + 1;
        versionIndexes.set(songKey, vIdx);
        const versionNumber = vIdx;
        const versionLabel = `v${versionNumber}`;

        // Deterministic status by sorted index
        const warnings: ImportWarning[] = [];
        let status: ImportVersionRecord['status'];

        if (i % 7 === 6) {
          status = 'discard';
          warnings.push({
            code: 'no-content',
            message: 'Archivo vacío o sin contenido musical (stub)',
          });
        } else if (i % 3 === 2) {
          status = 'review';
          warnings.push({
            code: 'title-fallback',
            message: 'Título inferido del nombre de archivo (stub)',
          });
        } else {
          status = 'ready';
        }

        const record: ImportVersionRecord = {
          id: crypto.randomUUID(),
          songKey,
          songTitle,
          fileName: file.fileName,
          relativePath: file.relativePath,
          versionLabel,
          versionNumber,
          title: songTitle,
          detectedArtist: null,
          tabType: TAB_TYPE_CYCLE[i % 3],
          instrument: meta.defaults.instrument,
          difficulty: meta.defaults.difficulty,
          targetStatus: meta.defaults.status,
          status,
          rawContent: '',
          warnings,
          logMeta: undefined,
        };

        records.push(record);
      }

      const summary: ImportSummary = { total: records.length, ready: 0, review: 0, discard: 0 };
      for (const r of records) {
        summary[r.status] += 1;
      }

      return { records, summary };
    },
  };
}
