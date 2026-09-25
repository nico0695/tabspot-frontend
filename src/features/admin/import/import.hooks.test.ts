import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { Difficulty, Instrument, TabStatus, TabType } from '@/lib/api/enums';
import { ApiError } from '@/lib/api/errors';
import { DEFAULT_IMPORT_DEFAULTS } from './import.constants';
import { useImportWizardStore } from './import.store';
import { sendBulkImport } from './import.api';
import { useBulkSend } from './import.hooks';
import type {
  BulkImportRequestDto,
  BulkImportResponseDto,
  ImportVersionRecord,
  ImportVersionStatus,
  RawImportFile,
} from './import.types';

const { mockInvalidateQueries, mockQueryClient } = vi.hoisted(() => {
  const mockInvalidateQueries = vi.fn();
  return { mockInvalidateQueries, mockQueryClient: { invalidateQueries: mockInvalidateQueries } };
});

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => mockQueryClient,
}));

vi.mock('./import.api', () => ({
  sendBulkImport: vi.fn(),
}));

const mockSend = vi.mocked(sendBulkImport);

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
    status: 'ready',
    rawContent: '',
    warnings: [],
    ...overrides,
  };
}

function makeRawFile(relativePath: string, text = 'content'): RawImportFile {
  const textFn = vi.fn().mockResolvedValue(text);
  return {
    relativePath,
    fileName: relativePath.split('/').pop() ?? relativePath,
    kind: 'cho',
    file: { text: textFn } as unknown as File,
  };
}

function setStore(records: ImportVersionRecord[], rawFiles: RawImportFile[] = []) {
  const byId: Record<string, ImportVersionRecord> = {};
  const ids: string[] = [];
  const summary = { total: records.length, ready: 0, review: 0, discard: 0 };
  for (const record of records) {
    byId[record.id] = record;
    ids.push(record.id);
    summary[record.status as ImportVersionStatus] += 1;
  }
  useImportWizardStore.setState({
    byId,
    ids,
    summary,
    rawFiles,
    artist: { name: 'Test Artist' },
    defaults: { ...DEFAULT_IMPORT_DEFAULTS },
  });
}

function seedReadySongs(count: number) {
  const records: ImportVersionRecord[] = [];
  const rawFiles: RawImportFile[] = [];
  for (let i = 0; i < count; i += 1) {
    const key = `song-${i}`;
    const relativePath = `artist/${key}/${key}.cho`;
    records.push(
      makeRecord(`id-${i}`, {
        songKey: key,
        songTitle: `Song ${i}`,
        relativePath,
        fileName: `${key}.cho`,
        status: 'ready',
      }),
    );
    rawFiles.push(makeRawFile(relativePath, `content-${i}`));
  }
  setStore(records, rawFiles);
}

function responseFor(
  dto: BulkImportRequestDto,
  overrides: Partial<BulkImportResponseDto> = {},
): BulkImportResponseDto {
  return {
    inserted: { artists: 0, songs: dto.songs.length, tabs: dto.songs.length },
    skipped: 0,
    results: dto.songs.map((song) => ({
      title: song.title,
      songStatus: 'created' as const,
      songId: `id:${song.title}`,
      tabsInserted: 1,
      tabsSkipped: 0,
    })),
    errors: [],
    ...overrides,
  };
}

function deferred<T>() {
  let resolveFn: (value: T) => void = () => {};
  const promise = new Promise<T>((resolve) => {
    resolveFn = resolve;
  });
  return { promise, resolve: resolveFn };
}

const batchResponse = (songs: number): BulkImportResponseDto => ({
  inserted: { artists: 0, songs, tabs: songs },
  skipped: 0,
  results: [],
  errors: [],
});

beforeEach(() => {
  useImportWizardStore.getState().reset();
  mockSend.mockReset();
  mockInvalidateQueries.mockReset();
});

describe('useBulkSend', () => {
  test('happy path: 250 songs chunk into 3 batches and complete', async () => {
    seedReadySongs(250);
    mockSend.mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(3);
    expect(mockSend.mock.calls[0][0].songs).toHaveLength(100);
    expect(mockSend.mock.calls[1][0].songs).toHaveLength(100);
    expect(mockSend.mock.calls[2][0].songs).toHaveLength(50);

    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('done');
    expect(state.sendProgress.batch).toBe(3);
    expect(state.sendProgress.totalBatches).toBe(3);
    expect(state.sendProgress.sent).toBe(250);
    expect(state.sendProgress.totalSongs).toBe(250);
    expect(state.sendResult?.inserted.songs).toBe(250);
    expect(state.sendResult?.results).toHaveLength(250);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['catalog'] });
  });

  test('413 single halve: retries the batch with half size and continues', async () => {
    seedReadySongs(100);
    mockSend
      .mockRejectedValueOnce(new ApiError(413, 'PAYLOAD_TOO_LARGE', 'too large'))
      .mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(3);
    expect(mockSend.mock.calls[0][0].songs).toHaveLength(100);
    expect(mockSend.mock.calls[1][0].songs).toHaveLength(50);
    expect(mockSend.mock.calls[2][0].songs).toHaveLength(50);
    expect(useImportWizardStore.getState().sendStatus).toBe('done');
  });

  test('413 double halve: 100 -> 50 -> 25 then success', async () => {
    seedReadySongs(100);
    mockSend
      .mockRejectedValueOnce(new ApiError(413, 'PAYLOAD_TOO_LARGE', 'too large'))
      .mockRejectedValueOnce(new ApiError(413, 'PAYLOAD_TOO_LARGE', 'too large'))
      .mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend.mock.calls[0][0].songs).toHaveLength(100);
    expect(mockSend.mock.calls[1][0].songs).toHaveLength(50);
    expect(mockSend.mock.calls[2][0].songs).toHaveLength(25);
    expect(useImportWizardStore.getState().sendStatus).toBe('done');
  });

  test('413 exhaustion: 100 -> 50 -> 25 -> error', async () => {
    seedReadySongs(100);
    mockSend.mockRejectedValue(new ApiError(413, 'PAYLOAD_TOO_LARGE', 'too large'));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(3);
    expect(mockSend.mock.calls[0][0].songs).toHaveLength(100);
    expect(mockSend.mock.calls[1][0].songs).toHaveLength(50);
    expect(mockSend.mock.calls[2][0].songs).toHaveLength(25);

    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('error');
    const error = state.sendProgress.errors.find((e) => e.code === 'PAYLOAD_TOO_LARGE');
    expect(error?.message).toBe('El lote es demasiado grande incluso con el tamaño reducido.');
  });

  test('pause between batches: batch 2 is not sent after pausing', async () => {
    seedReadySongs(150);
    const first = deferred<BulkImportResponseDto>();
    mockSend
      .mockImplementationOnce(() => first.promise)
      .mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      const loop = result.current.startSend();
      useImportWizardStore.getState().setSendStatus('paused');
      first.resolve(batchResponse(100));
      await loop;
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(useImportWizardStore.getState().sendStatus).toBe('paused');
  });

  test('resume: continues from the next unprocessed batch', async () => {
    seedReadySongs(150);
    const first = deferred<BulkImportResponseDto>();
    mockSend
      .mockImplementationOnce(() => first.promise)
      .mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      const loop = result.current.startSend();
      useImportWizardStore.getState().setSendStatus('paused');
      first.resolve(batchResponse(100));
      await loop;
    });

    expect(mockSend).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.resumeSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend.mock.calls[1][0].songs).toHaveLength(50);
    expect(useImportWizardStore.getState().sendStatus).toBe('done');
  });

  test('cancel: resets state and stops the loop', async () => {
    seedReadySongs(150);
    const first = deferred<BulkImportResponseDto>();
    mockSend
      .mockImplementationOnce(() => first.promise)
      .mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      const loop = result.current.startSend();
      // Cancel while batch 1 is in flight (S8: a cancel before the POST now skips it).
      await vi.waitFor(() => expect(mockSend).toHaveBeenCalledTimes(1));
      result.current.cancelSend();
      first.resolve(batchResponse(100));
      await loop;
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('idle');
    expect(state.sendProgress.sent).toBe(0);
    expect(state.sendResult).toBeNull();
  });

  test('retry on error: re-sends the failed batch and continues', async () => {
    seedReadySongs(150);
    mockSend
      .mockImplementationOnce(async (dto) => responseFor(dto))
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL_SERVER_ERROR', 'boom'))
      .mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(useImportWizardStore.getState().sendStatus).toBe('error');
    expect(mockSend.mock.calls[1][0].songs).toHaveLength(50);

    await act(async () => {
      await result.current.retrySend();
    });

    expect(mockSend).toHaveBeenCalledTimes(3);
    expect(mockSend.mock.calls[2][0].songs).toHaveLength(50);
    expect(useImportWizardStore.getState().sendStatus).toBe('done');
  });

  test('per-song errors in a 200 response are recorded and the loop continues', async () => {
    seedReadySongs(150);
    mockSend
      .mockImplementationOnce(async (dto) =>
        responseFor(dto, {
          errors: [
            {
              index: 1,
              title: dto.songs[1].title,
              code: 'SONG_PERSIST_FAILED',
              message: 'no se pudo guardar',
            },
          ],
        }),
      )
      .mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(2);
    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('done');
    expect(state.sendProgress.errors).toHaveLength(1);
    expect(state.sendProgress.errors[0].code).toBe('SONG_PERSIST_FAILED');
    expect(state.sendProgress.errors[0].songIndex).toBe(2);
    expect(state.sendResult?.errors).toHaveLength(1);
  });

  test('network error: non-ApiError rejection records NETWORK_ERROR and stops', async () => {
    seedReadySongs(100);
    mockSend.mockRejectedValue(new Error('socket hang up'));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('error');
    expect(state.sendProgress.errors[0].code).toBe('NETWORK_ERROR');
    expect(state.sendProgress.errors[0].message).toContain('conexión');
  });

  test('422 validation error: records the error and stops the loop', async () => {
    seedReadySongs(150);
    mockSend.mockRejectedValue(
      new ApiError(422, 'VALIDATION_ERROR', 'Invalid data', [
        { field: 'songs[0].title', message: 'Required' },
      ]),
    );

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('error');
    expect(state.sendProgress.errors[0].code).toBe('VALIDATION_ERROR');
  });

  test('empty song list: no ready songs means no API calls', async () => {
    setStore([makeRecord('r', { status: 'review' }), makeRecord('d', { status: 'discard' })]);
    mockSend.mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).not.toHaveBeenCalled();
    expect(useImportWizardStore.getState().sendStatus).toBe('done');
  });

  test('content materialization: file.text() is called and content lands in the DTO', async () => {
    const recordA = makeRecord('a', {
      songKey: 'a',
      songTitle: 'A',
      relativePath: 'a/a.cho',
      fileName: 'a.cho',
      status: 'ready',
    });
    const recordB = makeRecord('b', {
      songKey: 'b',
      songTitle: 'B',
      relativePath: 'b/b.cho',
      fileName: 'b.cho',
      status: 'ready',
    });
    const fileA = makeRawFile('a/a.cho', 'CONTENT_A');
    const fileB = makeRawFile('b/b.cho', 'CONTENT_B');
    setStore([recordA, recordB], [fileA, fileB]);
    mockSend.mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    const dto = mockSend.mock.calls[0][0];
    expect(dto.songs).toHaveLength(2);
    expect(dto.songs[0].versions[0].content).toBe('CONTENT_A');
    expect(dto.songs[1].versions[0].content).toBe('CONTENT_B');
    const textA = fileA.file.text as unknown as ReturnType<typeof vi.fn>;
    const textB = fileB.file.text as unknown as ReturnType<typeof vi.fn>;
    expect(textA).toHaveBeenCalledTimes(1);
    expect(textB).toHaveBeenCalledTimes(1);
  });

  test('missing file: version is skipped, FILE_NOT_FOUND recorded, loop continues', async () => {
    const present = makeRecord('v1', {
      songKey: 'k',
      songTitle: 'K',
      relativePath: 'k/one.cho',
      fileName: 'one.cho',
      status: 'ready',
    });
    const missing = makeRecord('v2', {
      songKey: 'k',
      songTitle: 'K',
      relativePath: 'k/two.cho',
      fileName: 'two.cho',
      status: 'ready',
    });
    setStore([present, missing], [makeRawFile('k/one.cho', 'C1')]);
    mockSend.mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const dto = mockSend.mock.calls[0][0];
    expect(dto.songs).toHaveLength(1);
    expect(dto.songs[0].versions).toHaveLength(1);
    expect(dto.songs[0].versions[0].content).toBe('C1');

    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('done');
    const error = state.sendProgress.errors.find((e) => e.code === 'FILE_NOT_FOUND');
    expect(error?.title).toBe('K');
  });

  test('filter by version status: only ready versions are included', async () => {
    const ready = makeRecord('r', {
      songKey: 'a',
      songTitle: 'A',
      relativePath: 'a/r.cho',
      status: 'ready',
    });
    const discarded = makeRecord('d', {
      songKey: 'a',
      songTitle: 'A',
      relativePath: 'a/d.cho',
      status: 'discard',
    });
    const reviewOnly = makeRecord('v', {
      songKey: 'b',
      songTitle: 'B',
      relativePath: 'b/v.cho',
      status: 'review',
    });
    setStore(
      [ready, discarded, reviewOnly],
      [makeRawFile('a/r.cho', 'R'), makeRawFile('a/d.cho', 'D'), makeRawFile('b/v.cho', 'V')],
    );
    mockSend.mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const dto = mockSend.mock.calls[0][0];
    expect(dto.songs).toHaveLength(1);
    expect(dto.songs[0].title).toBe('A');
    expect(dto.songs[0].versions).toHaveLength(1);
    expect(dto.songs[0].versions[0].content).toBe('R');
  });

  test('F1: 422 ApiError fields are captured on the send error', async () => {
    seedReadySongs(150);
    const fields = [
      { field: 'songs[0].title', message: 'Required' },
      { field: 'songs[3].versions', message: 'At least one version' },
    ];
    mockSend.mockRejectedValue(new ApiError(422, 'VALIDATION_ERROR', 'Invalid data', fields));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('error');
    const last = state.sendProgress.errors[state.sendProgress.errors.length - 1];
    expect(last.code).toBe('VALIDATION_ERROR');
    expect(last.fields).toEqual(fields);
  });

  test('F2a: FILE_NOT_FOUND uses the global 1-based index after a dropped song', async () => {
    const records: ImportVersionRecord[] = [];
    const rawFiles: RawImportFile[] = [];
    for (let i = 0; i < 150; i += 1) {
      const key = `song-${i}`;
      const relativePath = `artist/${key}/${key}.cho`;
      records.push(
        makeRecord(`id-${i}`, {
          songKey: key,
          songTitle: `Song ${i}`,
          relativePath,
          fileName: `${key}.cho`,
          status: 'ready',
        }),
      );
      if (i !== 0 && i !== 100) rawFiles.push(makeRawFile(relativePath, `content-${i}`));
    }
    setStore(records, rawFiles);
    mockSend.mockImplementation(async (dto) => responseFor(dto));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('done');
    const errors = state.sendProgress.errors.filter((e) => e.code === 'FILE_NOT_FOUND');
    expect(errors.find((e) => e.title === 'Song 0')?.songIndex).toBe(1);
    expect(errors.find((e) => e.title === 'Song 100')?.songIndex).toBe(101);
  });

  test('F2b: batch-level send error uses the global index of the first batch song', async () => {
    seedReadySongs(150);
    mockSend
      .mockImplementationOnce(async (dto) => responseFor(dto))
      .mockRejectedValueOnce(new ApiError(500, 'INTERNAL_SERVER_ERROR', 'boom'));

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('error');
    const error = state.sendProgress.errors.find((e) => e.code === 'INTERNAL_SERVER_ERROR');
    expect(error?.songIndex).toBe(101);
    expect(error?.title).toBe('Song 100');
  });

  test('F2c: per-song backend errors use full-list indices after an earlier dropped song', async () => {
    const records: ImportVersionRecord[] = [];
    const rawFiles: RawImportFile[] = [];
    for (let i = 0; i < 150; i += 1) {
      const key = `song-${i}`;
      const relativePath = `artist/${key}/${key}.cho`;
      records.push(
        makeRecord(`id-${i}`, {
          songKey: key,
          songTitle: `Song ${i}`,
          relativePath,
          fileName: `${key}.cho`,
          status: 'ready',
        }),
      );
      if (i !== 0) rawFiles.push(makeRawFile(relativePath, `content-${i}`));
    }
    setStore(records, rawFiles);
    mockSend
      .mockImplementationOnce(async (dto) => responseFor(dto))
      .mockImplementationOnce(async (dto) =>
        responseFor(dto, {
          errors: [
            {
              index: 1,
              title: dto.songs[1].title,
              code: 'SONG_PERSIST_FAILED',
              message: 'no se pudo guardar',
            },
          ],
        }),
      );

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('done');
    const error = state.sendProgress.errors.find((e) => e.code === 'SONG_PERSIST_FAILED');
    expect(error?.title).toBe('Song 101');
    expect(error?.songIndex).toBe(102);
  });

  test('F7: per-song backend error maps to original index when an earlier same-batch song is dropped', async () => {
    const records: ImportVersionRecord[] = [];
    const rawFiles: RawImportFile[] = [];
    for (let i = 0; i < 5; i += 1) {
      const key = `song-${i}`;
      const relativePath = `artist/${key}/${key}.cho`;
      records.push(
        makeRecord(`id-${i}`, {
          songKey: key,
          songTitle: `Song ${i}`,
          relativePath,
          fileName: `${key}.cho`,
          status: 'ready',
        }),
      );
      if (i !== 0) rawFiles.push(makeRawFile(relativePath, `content-${i}`));
    }
    setStore(records, rawFiles);
    mockSend.mockImplementationOnce(async (dto) =>
      responseFor(dto, {
        errors: [
          {
            index: 1,
            title: dto.songs[1].title,
            code: 'SONG_PERSIST_FAILED',
            message: 'no se pudo guardar',
          },
        ],
      }),
    );

    const { result } = renderHook(() => useBulkSend());
    await act(async () => {
      await result.current.startSend();
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const dto = mockSend.mock.calls[0][0];
    expect(dto.songs).toHaveLength(4);
    expect(dto.songs[1].title).toBe('Song 2');

    const state = useImportWizardStore.getState();
    expect(state.sendStatus).toBe('done');
    const error = state.sendProgress.errors.find((e) => e.code === 'SONG_PERSIST_FAILED');
    expect(error?.title).toBe('Song 2');
    expect(error?.songIndex).toBe(3);
  });

  describe('S8: send-loop concurrency, session lifetime, read failures', () => {
    test('(a) R3-001: resume while batch 1 is pending reuses the live loop (one POST per batch)', async () => {
      seedReadySongs(150);
      const first = deferred<BulkImportResponseDto>();
      mockSend
        .mockImplementationOnce(() => first.promise)
        .mockImplementation(async (dto) => responseFor(dto));

      const { result } = renderHook(() => useBulkSend());
      await act(async () => {
        const loop = result.current.startSend();
        await vi.waitFor(() => expect(mockSend).toHaveBeenCalledTimes(1));
        // Pause + resume while the first request is still in flight.
        result.current.pauseSend();
        const resumed = result.current.resumeSend();
        expect(useImportWizardStore.getState().sendStatus).toBe('running');
        await resumed;
        expect(mockSend).toHaveBeenCalledTimes(1);
        first.resolve(responseFor(mockSend.mock.calls[0][0]));
        await loop;
      });

      expect(mockSend).toHaveBeenCalledTimes(2);
      const sentTitles = mockSend.mock.calls.flatMap(([dto]) => dto.songs.map((s) => s.title));
      expect(sentTitles).toEqual(Array.from({ length: 150 }, (_, i) => `Song ${i}`));

      const state = useImportWizardStore.getState();
      expect(state.sendStatus).toBe('done');
      expect(state.sendProgress.sent).toBe(150);
      expect(state.sendResult?.inserted.songs).toBe(150);
      expect(state.sendResult?.results).toHaveLength(150);
    });

    test('(b) R3-003: cancel then start while the old request is pending ignores the stale response', async () => {
      seedReadySongs(150);
      const stale = deferred<BulkImportResponseDto>();
      const fresh = deferred<BulkImportResponseDto>();
      mockSend
        .mockImplementationOnce(() => stale.promise)
        .mockImplementationOnce(() => fresh.promise)
        .mockImplementation(async (dto) => responseFor(dto));

      const { result } = renderHook(() => useBulkSend());
      await act(async () => {
        const oldLoop = result.current.startSend();
        await vi.waitFor(() => expect(mockSend).toHaveBeenCalledTimes(1));
        result.current.cancelSend();
        const newLoop = result.current.startSend();
        await vi.waitFor(() => expect(mockSend).toHaveBeenCalledTimes(2));

        // Old response settles first: must not accumulate nor slice the new run's queue.
        stale.resolve(
          responseFor(mockSend.mock.calls[0][0], {
            inserted: { artists: 9, songs: 999, tabs: 999 },
          }),
        );
        await oldLoop;
        const mid = useImportWizardStore.getState();
        expect(mid.sendStatus).toBe('running');
        expect(mid.sendProgress.sent).toBe(0);
        expect(mid.sendProgress.batch).toBe(0);

        fresh.resolve(responseFor(mockSend.mock.calls[1][0]));
        await newLoop;
      });

      // 1 stale POST + 2 batches of the new run.
      expect(mockSend).toHaveBeenCalledTimes(3);
      expect(mockSend.mock.calls[1][0].songs).toHaveLength(100);
      expect(mockSend.mock.calls[1][0].songs[0].title).toBe('Song 0');
      expect(mockSend.mock.calls[2][0].songs).toHaveLength(50);
      expect(mockSend.mock.calls[2][0].songs[0].title).toBe('Song 100');

      const state = useImportWizardStore.getState();
      expect(state.sendStatus).toBe('done');
      expect(state.sendProgress.sent).toBe(150);
      expect(state.sendResult?.inserted).toEqual({ artists: 0, songs: 150, tabs: 150 });
      expect(state.sendResult?.results).toHaveLength(150);
    });

    test('(b2) R3-003: a stale request failing after cancel writes nothing', async () => {
      seedReadySongs(50);
      let rejectStale: (err: unknown) => void = () => {};
      mockSend.mockImplementationOnce(
        () =>
          new Promise<BulkImportResponseDto>((_, reject) => {
            rejectStale = reject;
          }),
      );

      const { result } = renderHook(() => useBulkSend());
      await act(async () => {
        const loop = result.current.startSend();
        await vi.waitFor(() => expect(mockSend).toHaveBeenCalledTimes(1));
        result.current.cancelSend();
        rejectStale(new ApiError(500, 'INTERNAL_SERVER_ERROR', 'boom'));
        await loop;
      });

      const state = useImportWizardStore.getState();
      expect(state.sendStatus).toBe('idle');
      expect(state.sendProgress.errors).toEqual([]);
    });

    test('(d) R1-002: file.text() rejection surfaces FILE_READ_ERROR and retry re-reads the batch', async () => {
      seedReadySongs(3);
      const rawFile = useImportWizardStore.getState().rawFiles[1];
      const textFn = vi.mocked(rawFile.file.text);
      textFn.mockRejectedValueOnce(new Error('NotReadableError'));
      mockSend.mockImplementation(async (dto) => responseFor(dto));

      const { result } = renderHook(() => useBulkSend());
      await act(async () => {
        await result.current.startSend();
      });

      expect(mockSend).not.toHaveBeenCalled();
      let state = useImportWizardStore.getState();
      expect(state.sendStatus).toBe('error');
      const error = state.sendProgress.errors.find((e) => e.code === 'FILE_READ_ERROR');
      expect(error).toMatchObject({
        batchIndex: 0,
        songIndex: 2,
        title: 'Song 1',
        message: "No se pudo leer el archivo 'song-1.cho'.",
      });

      await act(async () => {
        await result.current.retrySend();
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend.mock.calls[0][0].songs.map((s) => s.title)).toEqual([
        'Song 0',
        'Song 1',
        'Song 2',
      ]);
      state = useImportWizardStore.getState();
      expect(state.sendStatus).toBe('done');
      expect(state.sendResult?.inserted.songs).toBe(3);
    });

    test('(e) R4-001: unmount abandons the session and a fresh hook never resumes an orphan', async () => {
      seedReadySongs(150);
      const first = deferred<BulkImportResponseDto>();
      mockSend
        .mockImplementationOnce(() => first.promise)
        .mockImplementation(async (dto) => responseFor(dto));

      const { result, unmount } = renderHook(() => useBulkSend());
      let loop: Promise<void> = Promise.resolve();
      await act(async () => {
        loop = result.current.startSend();
        await vi.waitFor(() => expect(mockSend).toHaveBeenCalledTimes(1));
        result.current.pauseSend();
      });
      expect(useImportWizardStore.getState().sendStatus).toBe('paused');

      unmount();
      expect(useImportWizardStore.getState().sendStatus).toBe('idle');

      // The orphan loop wakes after unmount and must not touch the store.
      await act(async () => {
        first.resolve(responseFor(mockSend.mock.calls[0][0]));
        await loop;
      });
      let state = useImportWizardStore.getState();
      expect(state.sendStatus).toBe('idle');
      expect(state.sendProgress.sent).toBe(0);

      // Fresh hook, store forced into an orphaned 'paused' status.
      const fresh = renderHook(() => useBulkSend());
      useImportWizardStore.getState().setSendStatus('paused');
      await act(async () => {
        await fresh.result.current.resumeSend();
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      state = useImportWizardStore.getState();
      expect(state.sendStatus).toBe('idle');
      expect(state.sendResult).toBeNull();

      useImportWizardStore.getState().setSendStatus('error');
      await act(async () => {
        await fresh.result.current.retrySend();
      });
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(useImportWizardStore.getState().sendStatus).toBe('idle');
    });

    test('(e2) R4-001: unmount after done keeps the results in the store', async () => {
      seedReadySongs(10);
      mockSend.mockImplementation(async (dto) => responseFor(dto));

      const { result, unmount } = renderHook(() => useBulkSend());
      await act(async () => {
        await result.current.startSend();
      });
      unmount();

      const state = useImportWizardStore.getState();
      expect(state.sendStatus).toBe('done');
      expect(state.sendResult?.inserted.songs).toBe(10);
    });

    test('INV-S8-1: a second startSend while a loop is active is ignored', async () => {
      seedReadySongs(50);
      const first = deferred<BulkImportResponseDto>();
      mockSend.mockImplementationOnce(() => first.promise);

      const { result } = renderHook(() => useBulkSend());
      await act(async () => {
        const loop = result.current.startSend();
        await vi.waitFor(() => expect(mockSend).toHaveBeenCalledTimes(1));
        await result.current.startSend();
        first.resolve(responseFor(mockSend.mock.calls[0][0]));
        await loop;
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(useImportWizardStore.getState().sendStatus).toBe('done');
      expect(useImportWizardStore.getState().sendResult?.inserted.songs).toBe(50);
    });
  });
});
