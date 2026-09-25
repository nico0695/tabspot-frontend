import { create } from 'zustand';
import type { TabStatus, Difficulty, Instrument } from '@/lib/api/enums';
import { DEFAULT_IMPORT_DEFAULTS, DEFAULT_MAX_VERSIONS, IMPORT_STEPS } from './import.constants';
import type {
  ImportParseOutput,
  ImportStep,
  ImportSummary,
  ImportVersionRecord,
  ImportVersionStatus,
  RawImportFile,
  SendProgress,
  SendResult,
  SendStatus,
} from './import.types';

interface ImportArtist {
  id?: string;
  name: string;
}

interface ImportDefaults {
  status: TabStatus;
  difficulty: Difficulty;
  instrument: Instrument;
}

interface ImportWizardState {
  step: ImportStep;
  artist: ImportArtist | null;
  defaults: ImportDefaults;
  maxVersions: number;

  rawFiles: RawImportFile[];
  byId: Record<string, ImportVersionRecord>;
  ids: string[];
  summary: ImportSummary;

  isParsing: boolean;
  parseError: string | null;

  sendStatus: SendStatus;
  sendProgress: SendProgress;
  sendResult: SendResult | null;
}

interface ImportWizardActions {
  setArtist: (artist: ImportArtist | null) => void;
  setDefaults: (partial: Partial<ImportDefaults>) => void;
  setMaxVersions: (n: number) => void;
  addRawFiles: (files: RawImportFile[]) => void;
  removeBySongKey: (songKey: string) => void;
  setRecords: (output: ImportParseOutput) => void;
  updateRecord: (id: string, patch: Partial<ImportVersionRecord>) => void;
  setParsing: (b: boolean) => void;
  setParseError: (e: string | null) => void;
  setStep: (s: ImportStep) => void;
  setSendStatus: (status: SendStatus) => void;
  setSendProgress: (progress: SendProgress) => void;
  setSendResult: (result: SendResult) => void;
  resetSend: () => void;
  reset: () => void;
}

export type ImportWizardStore = ImportWizardState & ImportWizardActions;

const SEND_INITIAL: Pick<ImportWizardState, 'sendStatus' | 'sendProgress' | 'sendResult'> = {
  sendStatus: 'idle',
  sendProgress: { batch: 0, totalBatches: 0, sent: 0, totalSongs: 0, errors: [] },
  sendResult: null,
};

const initialState: ImportWizardState = {
  step: 'artist',
  artist: null,
  defaults: { ...DEFAULT_IMPORT_DEFAULTS },
  maxVersions: DEFAULT_MAX_VERSIONS,
  rawFiles: [],
  byId: {},
  ids: [],
  summary: { total: 0, ready: 0, review: 0, discard: 0 },
  isParsing: false,
  parseError: null,
  ...SEND_INITIAL,
};

export function canIntake(state: Pick<ImportWizardState, 'artist'>): boolean {
  return !!state.artist;
}

export function canReview(state: Pick<ImportWizardState, 'rawFiles'>): boolean {
  return state.rawFiles.length > 0;
}

export function canSend(state: Pick<ImportWizardState, 'summary'>): boolean {
  return state.summary.ready > 0;
}

// A send session is live while running, paused or errored: the in-memory queue lives in
// useBulkSend refs, so leaving the send step would orphan it.
export function isSendLocked(status: SendStatus): boolean {
  return status === 'running' || status === 'paused' || status === 'error';
}

export function canGoToStep(state: ImportWizardState, target: ImportStep): boolean {
  const fromIdx = IMPORT_STEPS.indexOf(state.step);
  const toIdx = IMPORT_STEPS.indexOf(target);
  if (toIdx < 0) return false;
  if (state.step === 'send' && target !== 'send' && isSendLocked(state.sendStatus)) return false;
  if (toIdx <= fromIdx) return true;
  for (let i = fromIdx + 1; i <= toIdx; i += 1) {
    const stepGate = IMPORT_STEPS[i];
    if (stepGate === 'intake' && !canIntake(state)) return false;
    if (stepGate === 'review' && !canReview(state)) return false;
    if (stepGate === 'send' && !canSend(state)) return false;
  }
  return true;
}

const STATUS_KEYS: Record<ImportVersionStatus, keyof Omit<ImportSummary, 'total'>> = {
  ready: 'ready',
  review: 'review',
  discard: 'discard',
};

export const useImportWizardStore = create<ImportWizardStore>()((set) => ({
  ...initialState,

  setArtist: (artist) => set({ artist }),

  setDefaults: (partial) => set((s) => ({ defaults: { ...s.defaults, ...partial } })),

  setMaxVersions: (n) => set({ maxVersions: n }),

  addRawFiles: (files) =>
    set((s) => {
      const seen = new Set(s.rawFiles.map((f) => f.relativePath));
      const additions = files.filter((f) => {
        if (seen.has(f.relativePath)) return false;
        seen.add(f.relativePath);
        return true;
      });
      if (additions.length === 0) return s;
      return { rawFiles: [...s.rawFiles, ...additions] };
    }),

  removeBySongKey: (songKey) =>
    set((s) => {
      const removedIds = s.ids.filter((id) => s.byId[id]?.songKey === songKey);
      if (removedIds.length === 0) return s;
      const removed = new Set(removedIds);
      const ids = s.ids.filter((id) => !removed.has(id));
      const byId: Record<string, ImportVersionRecord> = {};
      for (const id of ids) byId[id] = s.byId[id];
      const summary = { ...s.summary };
      for (const id of removedIds) {
        summary.total -= 1;
        summary[STATUS_KEYS[s.byId[id].status]] -= 1;
      }
      const rawFiles = s.rawFiles.filter((f) => {
        const stillReferenced = ids.some((id) => byId[id].relativePath === f.relativePath);
        return stillReferenced || f.kind === 'log' || f.kind === 'unknown';
      });
      return { ids, byId, summary, rawFiles };
    }),

  setRecords: (output) =>
    set(() => {
      const byId: Record<string, ImportVersionRecord> = {};
      const ids: string[] = [];
      for (const record of output.records) {
        byId[record.id] = record;
        ids.push(record.id);
      }
      return { byId, ids, summary: { ...output.summary } };
    }),

  updateRecord: (id, patch) =>
    set((s) => {
      const current = s.byId[id];
      if (!current) return s;
      const next: ImportVersionRecord = { ...current, ...patch };
      const byId = { ...s.byId, [id]: next };
      let summary = s.summary;
      if (patch.status !== undefined && patch.status !== current.status) {
        summary = { ...s.summary };
        summary[STATUS_KEYS[current.status]] -= 1;
        summary[STATUS_KEYS[next.status]] += 1;
      }
      return { byId, summary };
    }),

  setParsing: (b) => set({ isParsing: b }),

  setParseError: (e) => set({ parseError: e }),

  setStep: (s) =>
    set((state) => {
      if (s === state.step) return state;
      if (!canGoToStep(state, s)) return state;
      return { step: s };
    }),

  setSendStatus: (sendStatus) => set({ sendStatus }),

  setSendProgress: (sendProgress) => set({ sendProgress }),

  setSendResult: (sendResult) => set({ sendResult }),

  resetSend: () => set({ ...SEND_INITIAL }),

  reset: () => set({ ...initialState, defaults: { ...DEFAULT_IMPORT_DEFAULTS }, ...SEND_INITIAL }),
}));

export const selectCanIntake = (s: ImportWizardStore) => canIntake(s);
export const selectCanReview = (s: ImportWizardStore) => canReview(s);
export const selectCanSend = (s: ImportWizardStore) => canSend(s);
