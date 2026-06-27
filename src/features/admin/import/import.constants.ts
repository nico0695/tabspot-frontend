import { TabType, Instrument, Difficulty, TabStatus } from '@/lib/api/enums';
import type { ImportStep, ImportVersionStatus } from './import.types';

export const IMPORT_STEPS: ImportStep[] = ['artist', 'intake', 'review', 'send'];

export const ALLOWED_EXTENSIONS = ['.cho', '.chor', '.log'] as const;
export const IMPORTABLE_EXTENSIONS = ['.cho', '.chor'] as const; // .log is enrichment only, not a version

export const DEFAULT_MAX_VERSIONS = 10;
export const DEFAULT_BATCH_SIZE = 50;

export const TAB_STATUS_LABELS: Record<TabStatus, string> = {
  [TabStatus.DRAFT]: 'Borrador',
  [TabStatus.PENDING]: 'Pendiente',
  [TabStatus.PUBLISHED]: 'Publicada',
  [TabStatus.REJECTED]: 'Rechazada',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.BEGINNER]: 'Principiante',
  [Difficulty.INTERMEDIATE]: 'Intermedio',
  [Difficulty.ADVANCED]: 'Avanzado',
};

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  [Instrument.GUITAR]: 'Guitarra',
  [Instrument.BASS]: 'Bajo',
  [Instrument.UKULELE]: 'Ukelele',
  [Instrument.PIANO]: 'Piano',
};

export const TAB_TYPE_LABELS: Record<TabType, string> = {
  [TabType.CHORDS]: 'Acordes',
  [TabType.TAB]: 'Tablatura',
  [TabType.MIXED]: 'Mixto',
};

export const IMPORT_VERSION_STATUS_LABELS: Record<ImportVersionStatus, string> = {
  ready: 'Apta',
  review: 'Revisar',
  discard: 'Descartar',
};

export const DEFAULT_IMPORT_DEFAULTS: {
  status: TabStatus;
  difficulty: Difficulty;
  instrument: Instrument;
} = {
  status: TabStatus.DRAFT,
  difficulty: Difficulty.INTERMEDIATE,
  instrument: Instrument.GUITAR,
};
