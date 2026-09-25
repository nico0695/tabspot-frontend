'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';
import { sendBulkImport } from './import.api';
import { SEND_INITIAL_BATCH_SIZE, SEND_MAX_413_RETRIES } from './import.constants';
import { useImportWizardStore } from './import.store';
import { selectSongGroups, selectReadyCount } from './import.selectors';
import { createImportParser } from './parser/index';
import type { ImportSongGroup } from './import.selectors';
import type {
  BulkImportRequestDto,
  BulkImportResponseDto,
  BulkImportSongDto,
  BulkImportVersionDto,
  ImportSummary,
  ImportVersionRecord,
  SendError,
  SendResult,
} from './import.types';

export function useRunParse() {
  const rawFiles = useImportWizardStore((s) => s.rawFiles);
  const artist = useImportWizardStore((s) => s.artist);
  const defaults = useImportWizardStore((s) => s.defaults);
  const maxVersions = useImportWizardStore((s) => s.maxVersions);
  const setParsing = useImportWizardStore((s) => s.setParsing);
  const setParseError = useImportWizardStore((s) => s.setParseError);
  const setRecords = useImportWizardStore((s) => s.setRecords);

  const runParse = useCallback(async () => {
    if (!artist) return;
    const parser = createImportParser();
    const meta = {
      artist,
      defaults,
      maxVersions,
    };
    setParsing(true);
    setParseError(null);
    try {
      const output = await parser.parse(rawFiles, meta);
      setRecords(output);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Error al parsear archivos');
    } finally {
      setParsing(false);
    }
  }, [rawFiles, artist, defaults, maxVersions, setParsing, setParseError, setRecords]);

  return { runParse };
}

export interface ImportReviewState {
  groups: ImportSongGroup[];
  summary: ImportSummary;
  readyCount: number;
  isParsing: boolean;
  parseError: string | null;
}

export function useImportReview(): ImportReviewState {
  const byId = useImportWizardStore((s) => s.byId);
  const ids = useImportWizardStore((s) => s.ids);
  const summary = useImportWizardStore((s) => s.summary);
  const isParsing = useImportWizardStore((s) => s.isParsing);
  const parseError = useImportWizardStore((s) => s.parseError);

  // Pure call on each render; cheap enough without memoization until profiling says otherwise.
  const groups = selectSongGroups(byId, ids);
  const readyCount = selectReadyCount(summary);

  return { groups, summary, readyCount, isParsing, parseError };
}

interface ReadySong {
  songKey: string;
  songTitle: string;
  versions: ImportVersionRecord[];
}

function emptyResult(): SendResult {
  return { inserted: { artists: 0, songs: 0, tabs: 0 }, skipped: 0, results: [], errors: [] };
}

// Filter at version level (status === 'ready'), then group by songKey preserving id order.
function groupReadySongs(byId: Record<string, ImportVersionRecord>, ids: string[]): ReadySong[] {
  const order: string[] = [];
  const groups = new Map<string, ReadySong>();
  for (const id of ids) {
    const record = byId[id];
    if (!record || record.status !== 'ready') continue;
    const existing = groups.get(record.songKey);
    if (existing) {
      existing.versions.push(record);
    } else {
      order.push(record.songKey);
      groups.set(record.songKey, {
        songKey: record.songKey,
        songTitle: record.songTitle,
        versions: [record],
      });
    }
  }
  return order.map((key) => groups.get(key)!);
}

function toSendError(
  err: unknown,
  batchIndex: number,
  songIndex: number,
  title: string,
): SendError {
  if (err instanceof ApiError) {
    return {
      batchIndex,
      songIndex,
      title,
      code: err.code,
      message: err.userMessage,
      fields: err.fields,
    };
  }
  const message = err instanceof Error ? err.message : 'Error de conexión'; // fallback; userMessage below
  return {
    batchIndex,
    songIndex,
    title,
    code: 'NETWORK_ERROR',
    message: new ApiError(0, 'NETWORK_ERROR', message).userMessage,
  };
}

function accumulate(
  acc: SendResult,
  response: BulkImportResponseDto,
  batchErrors: SendError[],
  batchIndex: number,
  consumedBase: number,
  dtoGlobalIndexes: number[],
): void {
  acc.inserted.artists += response.inserted.artists;
  acc.inserted.songs += response.inserted.songs;
  acc.inserted.tabs += response.inserted.tabs;
  acc.skipped += response.skipped;
  acc.results.push(...response.results);
  for (const error of response.errors) {
    // `error.index` is 0-based relative to the submitted (post-drop) songs array; map it
    // through dtoGlobalIndexes to recover the original full-list 1-based position.
    const mapped = dtoGlobalIndexes[error.index];
    const songIndex = mapped ?? consumedBase + error.index + 1;
    acc.errors.push({
      batchIndex,
      songIndex,
      title: error.title,
      code: error.code,
      message: error.message,
    });
  }
  acc.errors.push(...batchErrors);
}

export interface UseBulkSendResult {
  startSend: () => Promise<void>;
  pauseSend: () => void;
  resumeSend: () => Promise<void>;
  cancelSend: () => void;
  retrySend: () => Promise<void>;
  isSending: boolean;
}

export function useBulkSend(): UseBulkSendResult {
  const rawFiles = useImportWizardStore((s) => s.rawFiles);
  const sendStatus = useImportWizardStore((s) => s.sendStatus);

  const queryClient = useQueryClient();

  // Mutable loop state via refs so resume/retry survive re-renders without stale closures.
  const pendingRef = useRef<ReadySong[]>([]);
  const accumulatedRef = useRef<SendResult>(emptyResult());
  const currentBatchSizeRef = useRef(SEND_INITIAL_BATCH_SIZE);
  const completedBatchesRef = useRef(0);
  const dispatchedRef = useRef(0);
  // Number of songs consumed (sent OR dropped) from the original ready list; the global
  // 1-based index of pendingRef.current[0] is consumedRef.current + 1.
  const consumedRef = useRef(0);
  const totalSongsRef = useRef(0);
  // Run generation: bumped by start/cancel/unmount. A loop whose captured id no longer
  // matches is stale and must not write refs or the store after any await.
  const runIdRef = useRef(0);
  // Single-flight guard: at most one loop iterates at a time.
  const loopActiveRef = useRef(false);
  // True while an in-memory session (queue + accumulator) exists; resume/retry need it.
  const hasSessionRef = useRef(false);

  const materializeContent = useCallback(
    async (record: ImportVersionRecord): Promise<string | null> => {
      const rawFile = rawFiles.find((f) => f.relativePath === record.relativePath);
      if (!rawFile) return null;
      return rawFile.file.text();
    },
    [rawFiles],
  );

  const updateProgress = useCallback(() => {
    const remaining = pendingRef.current.length;
    const totalBatches =
      completedBatchesRef.current + Math.ceil(remaining / currentBatchSizeRef.current);
    useImportWizardStore.getState().setSendProgress({
      batch: completedBatchesRef.current,
      totalBatches,
      sent: dispatchedRef.current,
      totalSongs: totalSongsRef.current,
      errors: [...accumulatedRef.current.errors],
    });
  }, []);

  const runLoop = useCallback(
    async (runId: number) => {
      // Single flight: a resume while a request is still pending reuses the live loop.
      if (loopActiveRef.current) return;
      const { artist, defaults } = useImportWizardStore.getState();
      if (!artist) return;

      loopActiveRef.current = true;
      // Checked after every await, before any ref/store write.
      const isStale = () => runIdRef.current !== runId;

      try {
        let halveRetries = 0;

        while (pendingRef.current.length > 0) {
          const batchSongs = pendingRef.current.slice(0, currentBatchSizeRef.current);
          const batchIndex = completedBatchesRef.current;
          const consumedBase = consumedRef.current;
          const dtoSongs: BulkImportSongDto[] = [];
          const dtoGlobalIndexes: number[] = [];
          const batchErrors: SendError[] = [];

          for (let i = 0; i < batchSongs.length; i += 1) {
            const song = batchSongs[i];
            const versions: BulkImportVersionDto[] = [];
            for (const record of song.versions) {
              let content: string | null;
              try {
                content = await materializeContent(record);
              } catch {
                if (isStale()) return;
                // Pending queue is not sliced, so Reintentar re-reads the same batch.
                accumulatedRef.current.errors.push(...batchErrors, {
                  batchIndex,
                  songIndex: consumedBase + i + 1,
                  title: song.songTitle,
                  code: 'FILE_READ_ERROR',
                  message: `No se pudo leer el archivo '${record.fileName}'.`,
                });
                updateProgress();
                useImportWizardStore.getState().setSendStatus('error');
                return;
              }
              if (isStale()) return;
              if (content === null) {
                batchErrors.push({
                  batchIndex,
                  songIndex: consumedBase + i + 1,
                  title: song.songTitle,
                  code: 'FILE_NOT_FOUND',
                  message: `No se encontró el archivo '${record.fileName}'.`,
                });
                continue;
              }
              versions.push({
                content,
                tabType: record.tabType,
                instrument: record.instrument,
                difficulty: record.difficulty,
                status: record.targetStatus,
                titleOverride: null,
              });
            }
            if (versions.length > 0) {
              dtoSongs.push({ title: song.songTitle, genreIds: [], versions });
              dtoGlobalIndexes.push(consumedBase + i + 1);
            }
          }

          // Nothing materializable in this batch: record errors, drop it, continue.
          if (dtoSongs.length === 0) {
            accumulatedRef.current.errors.push(...batchErrors);
            pendingRef.current = pendingRef.current.slice(batchSongs.length);
            consumedRef.current += batchSongs.length;
            completedBatchesRef.current += 1;
            updateProgress();
            if (useImportWizardStore.getState().sendStatus !== 'running') return;
            continue;
          }

          const dto: BulkImportRequestDto = { artist, defaults, songs: dtoSongs };

          let response: BulkImportResponseDto;
          try {
            response = await sendBulkImport(dto);
          } catch (err) {
            if (isStale()) return;
            if (err instanceof ApiError && err.status === 413) {
              if (halveRetries >= SEND_MAX_413_RETRIES - 1) {
                accumulatedRef.current.errors.push({
                  batchIndex,
                  songIndex: consumedBase + 1,
                  title: batchSongs[0]?.songTitle ?? '',
                  code: 'PAYLOAD_TOO_LARGE',
                  message: 'El lote es demasiado grande incluso con el tamaño reducido.',
                });
                updateProgress();
                useImportWizardStore.getState().setSendStatus('error');
                return;
              }
              halveRetries += 1;
              currentBatchSizeRef.current = Math.max(
                1,
                Math.floor(currentBatchSizeRef.current / 2),
              );
              continue;
            }

            const sendError = toSendError(
              err,
              batchIndex,
              consumedBase + 1,
              batchSongs[0]?.songTitle ?? '',
            );
            accumulatedRef.current.errors.push(...batchErrors, sendError);
            updateProgress();
            useImportWizardStore.getState().setSendStatus('error');
            return;
          }
          if (isStale()) return;

          halveRetries = 0;
          accumulate(
            accumulatedRef.current,
            response,
            batchErrors,
            batchIndex,
            consumedBase,
            dtoGlobalIndexes,
          );
          dispatchedRef.current += dtoSongs.length;
          pendingRef.current = pendingRef.current.slice(batchSongs.length);
          consumedRef.current += batchSongs.length;
          completedBatchesRef.current += 1;

          // Read status from the store (not the closure) so pause/cancel take effect between batches.
          const status = useImportWizardStore.getState().sendStatus;
          if (status === 'running' || status === 'paused') {
            updateProgress();
          }
          if (status !== 'running') return;
        }

        if (useImportWizardStore.getState().sendStatus === 'running') {
          // Session finished: results live in the store, so unmount must not reset them.
          hasSessionRef.current = false;
          useImportWizardStore.getState().setSendStatus('done');
          useImportWizardStore.getState().setSendResult({
            inserted: { ...accumulatedRef.current.inserted },
            skipped: accumulatedRef.current.skipped,
            results: [...accumulatedRef.current.results],
            errors: [...accumulatedRef.current.errors],
          });
          queryClient.invalidateQueries({ queryKey: ['admin'] });
          queryClient.invalidateQueries({ queryKey: ['catalog'] });
        }
      } finally {
        // Never clear the guard of a newer run (cancel → start while this one was pending).
        if (!isStale()) loopActiveRef.current = false;
      }
    },
    [materializeContent, updateProgress, queryClient],
  );

  const startSend = useCallback(async () => {
    if (loopActiveRef.current) return;
    const state = useImportWizardStore.getState();
    if (!state.artist) return;

    runIdRef.current += 1;
    const runId = runIdRef.current;

    const readySongs = groupReadySongs(state.byId, state.ids);
    pendingRef.current = readySongs;
    accumulatedRef.current = emptyResult();
    currentBatchSizeRef.current = SEND_INITIAL_BATCH_SIZE;
    completedBatchesRef.current = 0;
    dispatchedRef.current = 0;
    consumedRef.current = 0;
    totalSongsRef.current = readySongs.length;
    hasSessionRef.current = true;

    state.resetSend();
    state.setSendStatus('running');
    state.setSendProgress({
      batch: 0,
      totalBatches: Math.ceil(readySongs.length / SEND_INITIAL_BATCH_SIZE),
      sent: 0,
      totalSongs: readySongs.length,
      errors: [],
    });

    await runLoop(runId);
  }, [runLoop]);

  const pauseSend = useCallback(() => {
    const state = useImportWizardStore.getState();
    if (state.sendStatus === 'running') state.setSendStatus('paused');
  }, []);

  // Shared by resume (from paused) and retry (from error).
  const continueSend = useCallback(
    async (from: 'paused' | 'error') => {
      const state = useImportWizardStore.getState();
      if (state.sendStatus !== from) return;
      // Orphaned status (e.g. store survived an unmount): never loop over empty refs.
      if (!hasSessionRef.current) {
        state.resetSend();
        return;
      }
      state.setSendStatus('running');
      // A request from before the pause is still in flight: that loop reads 'running' after
      // its await and continues, so exactly one POST per batch.
      if (loopActiveRef.current) return;
      await runLoop(runIdRef.current);
    },
    [runLoop],
  );

  const resumeSend = useCallback(() => continueSend('paused'), [continueSend]);

  const retrySend = useCallback(() => continueSend('error'), [continueSend]);

  const cancelSend = useCallback(() => {
    runIdRef.current += 1;
    loopActiveRef.current = false;
    hasSessionRef.current = false;
    pendingRef.current = [];
    accumulatedRef.current = emptyResult();
    currentBatchSizeRef.current = SEND_INITIAL_BATCH_SIZE;
    completedBatchesRef.current = 0;
    dispatchedRef.current = 0;
    consumedRef.current = 0;
    totalSongsRef.current = 0;
    useImportWizardStore.getState().resetSend();
  }, []);

  // Unmount (e.g. leaving /admin/import via the sidebar) abandons a live session: stop the
  // orphan loop from touching the store and return the store to idle. StrictMode's
  // simulated remount is a no-op because no session exists at first mount.
  useEffect(() => {
    return () => {
      if (!hasSessionRef.current) return;
      hasSessionRef.current = false;
      runIdRef.current += 1;
      loopActiveRef.current = false;
      useImportWizardStore.getState().resetSend();
    };
  }, []);

  return {
    startSend,
    pauseSend,
    resumeSend,
    cancelSend,
    retrySend,
    isSending: sendStatus === 'running' || sendStatus === 'paused',
  };
}
