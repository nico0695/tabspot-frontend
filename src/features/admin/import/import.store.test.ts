import { beforeEach, describe, expect, test } from 'vitest';
import { Difficulty, Instrument, TabStatus, TabType } from '@/lib/api/enums';
import { DEFAULT_IMPORT_DEFAULTS, DEFAULT_MAX_VERSIONS } from './import.constants';
import { canGoToStep, isSendLocked, useImportWizardStore } from './import.store';
import { selectSongGroups } from './import.selectors';
import type {
  ImportParseOutput,
  ImportVersionRecord,
  ImportVersionStatus,
  SendProgress,
  SendResult,
  SendStatus,
} from './import.types';

function makeRecord(id: string, overrides: Partial<ImportVersionRecord> = {}): ImportVersionRecord {
  return {
    id,
    songKey: `song-${id}`,
    songTitle: `Song ${id}`,
    fileName: `${id}.cho`,
    relativePath: `artist/${id}/${id}.cho`,
    versionLabel: 'v1',
    versionNumber: 1,
    title: `Title ${id}`,
    detectedArtist: null,
    tabType: TabType.CHORDS,
    instrument: Instrument.GUITAR,
    difficulty: Difficulty.INTERMEDIATE,
    targetStatus: TabStatus.DRAFT,
    status: 'review',
    rawContent: '',
    warnings: [],
    ...overrides,
  };
}

function makeRawFile(relativePath: string) {
  return {
    relativePath,
    fileName: relativePath.split('/').pop() ?? relativePath,
    kind: 'cho' as const,
    file: new File([''], relativePath.split('/').pop() ?? relativePath),
  };
}

function makeOutput(records: ImportVersionRecord[]): ImportParseOutput {
  const summary = { total: records.length, ready: 0, review: 0, discard: 0 };
  for (const r of records) summary[r.status as ImportVersionStatus] += 1;
  return { records, summary };
}

function makeProgress(overrides: Partial<SendProgress> = {}): SendProgress {
  return { batch: 1, totalBatches: 3, sent: 100, totalSongs: 250, errors: [], ...overrides };
}

function makeResult(overrides: Partial<SendResult> = {}): SendResult {
  return {
    inserted: { artists: 1, songs: 2, tabs: 3 },
    skipped: 0,
    results: [
      { title: 'Song A', songStatus: 'created', songId: 's1', tabsInserted: 3, tabsSkipped: 0 },
    ],
    errors: [],
    ...overrides,
  };
}

beforeEach(() => {
  useImportWizardStore.getState().reset();
});

describe('initial state', () => {
  test('matches defaults', () => {
    const s = useImportWizardStore.getState();
    expect(s.step).toBe('artist');
    expect(s.artist).toBeNull();
    expect(s.defaults).toEqual(DEFAULT_IMPORT_DEFAULTS);
    expect(s.maxVersions).toBe(DEFAULT_MAX_VERSIONS);
    expect(s.rawFiles).toEqual([]);
    expect(s.byId).toEqual({});
    expect(s.ids).toEqual([]);
    expect(s.summary).toEqual({ total: 0, ready: 0, review: 0, discard: 0 });
    expect(s.isParsing).toBe(false);
    expect(s.parseError).toBeNull();
  });
});

describe('send state', () => {
  test('initial send state is idle/empty/null', () => {
    const s = useImportWizardStore.getState();
    expect(s.sendStatus).toBe('idle');
    expect(s.sendProgress).toEqual({
      batch: 0,
      totalBatches: 0,
      sent: 0,
      totalSongs: 0,
      errors: [],
    });
    expect(s.sendResult).toBeNull();
  });

  test('setSendStatus transitions correctly (idle -> running -> paused -> done)', () => {
    const store = useImportWizardStore;
    const transitions: SendStatus[] = ['running', 'paused', 'running', 'done'];
    for (const status of transitions) {
      store.getState().setSendStatus(status);
      expect(store.getState().sendStatus).toBe(status);
    }
  });

  test('setSendProgress updates progress', () => {
    const progress = makeProgress({ batch: 2, sent: 200, totalSongs: 250 });
    useImportWizardStore.getState().setSendProgress(progress);
    expect(useImportWizardStore.getState().sendProgress).toEqual(progress);
  });

  test('setSendResult stores result', () => {
    const result = makeResult();
    useImportWizardStore.getState().setSendResult(result);
    expect(useImportWizardStore.getState().sendResult).toEqual(result);
  });

  test('resetSend clears all send state to initial', () => {
    const store = useImportWizardStore;
    store.getState().setSendStatus('done');
    store.getState().setSendProgress(makeProgress());
    store.getState().setSendResult(makeResult());
    store.getState().resetSend();
    const s = store.getState();
    expect(s.sendStatus).toBe('idle');
    expect(s.sendProgress).toEqual({
      batch: 0,
      totalBatches: 0,
      sent: 0,
      totalSongs: 0,
      errors: [],
    });
    expect(s.sendResult).toBeNull();
  });

  test('reset() clears send state along with everything else', () => {
    const store = useImportWizardStore;
    store.getState().setArtist({ name: 'Almafuerte' });
    store.getState().setSendStatus('running');
    store.getState().setSendProgress(makeProgress());
    store.getState().setSendResult(makeResult());
    store.getState().reset();
    const s = store.getState();
    expect(s.artist).toBeNull();
    expect(s.step).toBe('artist');
    expect(s.sendStatus).toBe('idle');
    expect(s.sendProgress).toEqual({
      batch: 0,
      totalBatches: 0,
      sent: 0,
      totalSongs: 0,
      errors: [],
    });
    expect(s.sendResult).toBeNull();
  });
});

describe('gating (IU-03)', () => {
  test('cannot go to intake without an artist', () => {
    const store = useImportWizardStore;
    store.getState().setStep('intake');
    expect(store.getState().step).toBe('artist');
  });

  test('can go to intake after setting an artist', () => {
    const store = useImportWizardStore;
    store.getState().setArtist({ name: 'Almafuerte' });
    store.getState().setStep('intake');
    expect(store.getState().step).toBe('intake');
  });

  test('cannot go to review without raw files', () => {
    const store = useImportWizardStore;
    store.getState().setArtist({ name: 'Almafuerte' });
    store.getState().setStep('intake');
    store.getState().setStep('review');
    expect(store.getState().step).toBe('intake');
  });

  test('can go to review once raw files exist', () => {
    const store = useImportWizardStore;
    store.getState().setArtist({ name: 'Almafuerte' });
    store.getState().addRawFiles([makeRawFile('a/x.cho')]);
    store.getState().setStep('intake');
    store.getState().setStep('review');
    expect(store.getState().step).toBe('review');
  });

  test('cannot go to send without a ready record', () => {
    const store = useImportWizardStore;
    store.getState().setArtist({ name: 'Almafuerte' });
    store.getState().addRawFiles([makeRawFile('a/x.cho')]);
    store.getState().setRecords(makeOutput([makeRecord('1', { status: 'review' })]));
    store.getState().setStep('review');
    store.getState().setStep('send');
    expect(store.getState().step).toBe('review');
  });

  test('can go to send when a ready record exists', () => {
    const store = useImportWizardStore;
    store.getState().setArtist({ name: 'Almafuerte' });
    store.getState().addRawFiles([makeRawFile('a/x.cho')]);
    store.getState().setRecords(makeOutput([makeRecord('1', { status: 'ready' })]));
    store.getState().setStep('review');
    store.getState().setStep('send');
    expect(store.getState().step).toBe('send');
  });

  test('backward navigation is always allowed', () => {
    const store = useImportWizardStore;
    store.getState().setArtist({ name: 'Almafuerte' });
    store.getState().addRawFiles([makeRawFile('a/x.cho')]);
    store.getState().setRecords(makeOutput([makeRecord('1', { status: 'ready' })]));
    store.getState().setStep('send');
    expect(store.getState().step).toBe('send');
    store.getState().setStep('artist');
    expect(store.getState().step).toBe('artist');
  });

  test('illegal forward jump is a no-op (state unchanged)', () => {
    const store = useImportWizardStore;
    const before = store.getState();
    store.getState().setStep('send');
    expect(store.getState().step).toBe('artist');
    expect(store.getState()).toBe(before);
  });

  test('canGoToStep helper matches the guard', () => {
    const s = useImportWizardStore.getState();
    expect(canGoToStep(s, 'intake')).toBe(false);
    expect(canGoToStep(s, 'artist')).toBe(true);
  });
});

describe('send lock (R4-001)', () => {
  function enterSendStep() {
    const store = useImportWizardStore;
    store.getState().setArtist({ name: 'Almafuerte' });
    store.getState().addRawFiles([makeRawFile('a/x.cho')]);
    store.getState().setRecords(makeOutput([makeRecord('1', { status: 'ready' })]));
    store.getState().setStep('send');
    expect(store.getState().step).toBe('send');
  }

  test('isSendLocked is true only for running, paused and error', () => {
    const cases: [SendStatus, boolean][] = [
      ['idle', false],
      ['running', true],
      ['paused', true],
      ['error', true],
      ['done', false],
    ];
    for (const [status, locked] of cases) expect(isSendLocked(status)).toBe(locked);
  });

  test.each<SendStatus>(['running', 'paused', 'error'])(
    'leaving send is rejected while %s',
    (status) => {
      enterSendStep();
      const store = useImportWizardStore;
      store.getState().setSendStatus(status);
      for (const target of ['review', 'intake', 'artist'] as const) {
        expect(canGoToStep(store.getState(), target)).toBe(false);
        store.getState().setStep(target);
        expect(store.getState().step).toBe('send');
      }
      expect(canGoToStep(store.getState(), 'send')).toBe(true);
    },
  );

  test.each<SendStatus>(['idle', 'done'])('leaving send is allowed while %s', (status) => {
    enterSendStep();
    const store = useImportWizardStore;
    store.getState().setSendStatus(status);
    expect(canGoToStep(store.getState(), 'review')).toBe(true);
    expect(canGoToStep(store.getState(), 'artist')).toBe(true);
    store.getState().setStep('review');
    expect(store.getState().step).toBe('review');
    store.getState().setStep('artist');
    expect(store.getState().step).toBe('artist');
  });

  test('cancel (resetSend) from error re-enables navigation', () => {
    enterSendStep();
    const store = useImportWizardStore;
    store.getState().setSendStatus('error');
    store.getState().setStep('review');
    expect(store.getState().step).toBe('send');
    store.getState().resetSend();
    store.getState().setStep('review');
    expect(store.getState().step).toBe('review');
  });
});

describe('setRecords normalization', () => {
  test('normalizes records into byId/ids preserving order and sets summary', () => {
    const records = [
      makeRecord('a', { status: 'ready' }),
      makeRecord('b', { status: 'review' }),
      makeRecord('c', { status: 'discard' }),
    ];
    useImportWizardStore.getState().setRecords(makeOutput(records));
    const s = useImportWizardStore.getState();
    expect(s.ids).toEqual(['a', 'b', 'c']);
    expect(Object.keys(s.byId).sort()).toEqual(['a', 'b', 'c']);
    expect(s.byId.a.status).toBe('ready');
    expect(s.summary).toEqual({ total: 3, ready: 1, review: 1, discard: 1 });
  });
});

describe('updateRecord summary diff', () => {
  test('status review->ready adjusts only ready/review, total unchanged', () => {
    const records = [makeRecord('a', { status: 'review' }), makeRecord('b', { status: 'discard' })];
    useImportWizardStore.getState().setRecords(makeOutput(records));
    useImportWizardStore.getState().updateRecord('a', { status: 'ready' });
    const s = useImportWizardStore.getState();
    expect(s.summary).toEqual({ total: 2, ready: 1, review: 0, discard: 1 });
    expect(s.byId.a.status).toBe('ready');
  });

  test('non-status patch does not change summary', () => {
    useImportWizardStore.getState().setRecords(makeOutput([makeRecord('a', { status: 'review' })]));
    const before = useImportWizardStore.getState().summary;
    useImportWizardStore.getState().updateRecord('a', { title: 'New title' });
    const s = useImportWizardStore.getState();
    expect(s.summary).toBe(before);
    expect(s.byId.a.title).toBe('New title');
  });
});

describe('addRawFiles de-dupe', () => {
  test('de-dupes by relativePath, existing ones win', () => {
    const store = useImportWizardStore;
    store.getState().addRawFiles([makeRawFile('a/x.cho'), makeRawFile('a/y.cho')]);
    store.getState().addRawFiles([makeRawFile('a/x.cho'), makeRawFile('a/z.cho')]);
    const paths = store.getState().rawFiles.map((f) => f.relativePath);
    expect(paths).toEqual(['a/x.cho', 'a/y.cho', 'a/z.cho']);
  });
});

describe('selectSongGroups', () => {
  test('groups by songKey, preserves first-seen order, worst-of aggregate', () => {
    const records = [
      makeRecord('1', { songKey: 'k1', songTitle: 'One', status: 'ready' }),
      makeRecord('2', { songKey: 'k2', songTitle: 'Two', status: 'review' }),
      makeRecord('3', { songKey: 'k1', songTitle: 'One', status: 'discard' }),
      makeRecord('4', { songKey: 'k2', songTitle: 'Two', status: 'ready' }),
    ];
    useImportWizardStore.getState().setRecords(makeOutput(records));
    const { byId, ids } = useImportWizardStore.getState();
    const groups = selectSongGroups(byId, ids);

    expect(groups.map((g) => g.songKey)).toEqual(['k1', 'k2']);
    expect(groups[0].versionIds).toEqual(['1', '3']);
    expect(groups[0].aggregateStatus).toBe('discard'); // worst-of(ready, discard)
    expect(groups[1].versionIds).toEqual(['2', '4']);
    expect(groups[1].aggregateStatus).toBe('review'); // worst-of(review, ready)
  });
});
