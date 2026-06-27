import type { TabType, Instrument, Difficulty, TabStatus } from '@/lib/api/enums';

export type RawFileKind = 'cho' | 'chor' | 'log' | 'unknown';

export interface RawImportFile {
  relativePath: string;
  fileName: string;
  kind: RawFileKind;
  file: File; // read lazily via file.text()
}

export interface IntakeAdapter {
  readonly id: 'folder' | 'loose' | 'zip';
  collect(source: DataTransfer | FileList): Promise<RawImportFile[]>;
}

export type ImportVersionStatus = 'ready' | 'review' | 'discard';

export interface ImportWarning {
  code: string;
  message: string;
}

export interface ImportLogMeta {
  artist?: string;
  song?: string;
  processedAt?: string;
  versions?: { name: string; status: string; tokens?: number }[];
}

export interface ImportVersionRecord {
  id: string;
  songKey: string;
  songTitle: string;
  fileName: string;
  relativePath: string;
  versionLabel: string;
  versionNumber: number;
  title: string;
  detectedArtist: string | null;
  tabType: TabType;
  instrument: Instrument;
  difficulty: Difficulty;
  targetStatus: TabStatus;
  status: ImportVersionStatus;
  rawContent: string; // VERBATIM .cho; '' until lazily materialized
  warnings: ImportWarning[];
  logMeta?: ImportLogMeta;
}

export interface ImportSessionMeta {
  artist: { id?: string; name: string; sortName?: string };
  defaults: { status: TabStatus; difficulty: Difficulty; instrument: Instrument };
  maxVersions: number;
}

export interface ImportSummary {
  total: number;
  ready: number;
  review: number;
  discard: number;
}

export interface ImportParseOutput {
  records: ImportVersionRecord[];
  summary: ImportSummary;
}

export interface ImportParser {
  parse(files: RawImportFile[], meta: ImportSessionMeta): Promise<ImportParseOutput>;
}

export type ImportStep = 'artist' | 'intake' | 'review' | 'send';
export type SendStatus = 'idle' | 'running' | 'paused' | 'done' | 'error';
