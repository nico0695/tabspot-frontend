import type { ImportSummary, ImportVersionRecord, ImportVersionStatus } from './import.types';

export interface ImportSongGroup {
  songKey: string;
  songTitle: string;
  versionIds: string[];
  aggregateStatus: ImportVersionStatus;
}

// worst-of order: discard > review > ready
const STATUS_SEVERITY: Record<ImportVersionStatus, number> = {
  ready: 0,
  review: 1,
  discard: 2,
};

function worseStatus(a: ImportVersionStatus, b: ImportVersionStatus): ImportVersionStatus {
  return STATUS_SEVERITY[b] > STATUS_SEVERITY[a] ? b : a;
}

// aggregateStatus = worst-of version statuses: discard > review > ready
export function selectSongGroups(
  byId: Record<string, ImportVersionRecord>,
  ids: string[],
): ImportSongGroup[] {
  const order: string[] = [];
  const groups = new Map<string, ImportSongGroup>();

  for (const id of ids) {
    const record = byId[id];
    if (!record) continue;
    const existing = groups.get(record.songKey);
    if (existing) {
      existing.versionIds.push(id);
      existing.aggregateStatus = worseStatus(existing.aggregateStatus, record.status);
    } else {
      order.push(record.songKey);
      groups.set(record.songKey, {
        songKey: record.songKey,
        songTitle: record.songTitle,
        versionIds: [id],
        aggregateStatus: record.status,
      });
    }
  }

  return order.map((key) => groups.get(key)!);
}

export function selectReadyCount(summary: ImportSummary): number {
  return summary.ready;
}
