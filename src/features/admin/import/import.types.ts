import type { TabType, Instrument, Difficulty, TabStatus } from '@/lib/api/enums';
import type { FieldError } from '@/lib/api/types';

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

// --- Request DTOs (aligned to openapi.json) ---

export interface BulkImportArtistDto {
  id?: string;
  name: string;
  sortName?: string;
}

export interface BulkImportDefaultsDto {
  status: TabStatus;
  difficulty: Difficulty;
  instrument: Instrument;
}

export interface BulkImportVersionDto {
  content: string;
  tabType: TabType;
  instrument?: Instrument;
  difficulty?: Difficulty;
  status?: TabStatus;
  titleOverride?: string | null;
}

export interface BulkImportSongDto {
  title: string;
  subtitle?: string | null;
  releaseYear?: number | null;
  genreIds?: string[];
  versions: BulkImportVersionDto[];
}

export interface BulkImportRequestDto {
  artist: BulkImportArtistDto;
  defaults: BulkImportDefaultsDto;
  songs: BulkImportSongDto[]; // max 100
}

// --- Response DTOs ---

export interface BulkImportInserted {
  artists: number;
  songs: number;
  tabs: number;
}

export interface BulkImportSongResult {
  title: string;
  songStatus: 'created' | 'reused';
  songId: string;
  tabsInserted: number;
  tabsSkipped: number;
}

export interface BulkImportSongError {
  index: number;
  title: string;
  code: 'INVALID_GENRE_IDS' | 'SONG_PERSIST_FAILED';
  message: string;
}

export interface BulkImportResponseDto {
  inserted: BulkImportInserted;
  skipped: number;
  results: BulkImportSongResult[];
  errors: BulkImportSongError[];
}

// --- Send State Types ---

export interface SendError {
  batchIndex: number;
  songIndex: number;
  title: string;
  code: string;
  message: string;
  fields?: FieldError[];
}

export interface SendProgress {
  batch: number;
  totalBatches: number;
  sent: number;
  totalSongs: number;
  errors: SendError[];
}

export interface SendResult {
  inserted: BulkImportInserted;
  skipped: number;
  results: BulkImportSongResult[];
  errors: SendError[];
}
