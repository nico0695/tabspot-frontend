'use client';

import { useCallback } from 'react';
import { useImportWizardStore } from './import.store';
import { selectSongGroups, selectReadyCount } from './import.selectors';
import { createImportParser } from './parser/index';
import type { ImportSongGroup } from './import.selectors';
import type { ImportSummary } from './import.types';

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
