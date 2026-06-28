'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useRunParse, useImportReview } from '@/features/admin/import/import.hooks';
import { useImportWizardStore } from '@/features/admin/import/import.store';
import {
  IMPORT_VERSION_STATUS_LABELS,
  DIFFICULTY_LABELS,
  INSTRUMENT_LABELS,
  TAB_TYPE_LABELS,
  TAB_STATUS_LABELS,
} from '@/features/admin/import/import.constants';
import type { ImportVersionStatus } from '@/features/admin/import/import.types';
import type { Difficulty, Instrument } from '@/lib/api/enums';
import styles from './ReviewStep.module.css';

function toOptions<T extends string>(labels: Record<T, string>): SelectOption[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));
}

const STATUS_OPTIONS = toOptions(IMPORT_VERSION_STATUS_LABELS);
const DIFFICULTY_OPTIONS = toOptions(DIFFICULTY_LABELS);
const INSTRUMENT_OPTIONS = toOptions(INSTRUMENT_LABELS);

function statusBadgeVariant(
  status: ImportVersionStatus,
): 'published' | 'pending' | 'rejected' | 'default' {
  if (status === 'ready') return 'published';
  if (status === 'review') return 'pending';
  if (status === 'discard') return 'rejected';
  return 'default';
}

export function ReviewStep() {
  const { runParse } = useRunParse();
  const { groups, summary, readyCount, isParsing, parseError } = useImportReview();

  const byId = useImportWizardStore((s) => s.byId);
  const rawFiles = useImportWizardStore((s) => s.rawFiles);
  const updateRecord = useImportWizardStore((s) => s.updateRecord);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewCache, setPreviewCache] = useState<Map<string, string>>(new Map());
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    runParse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleGroup = useCallback((songKey: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(songKey)) {
        next.delete(songKey);
      } else {
        next.add(songKey);
      }
      return next;
    });
  }, []);

  // Reads file.text() on first open; subsequent opens use the cache.
  const openPreview = useCallback(
    async (id: string) => {
      setPreviewId(id);
      if (previewCache.has(id)) return;
      const record = byId[id];
      if (!record) return;
      const rawFile = rawFiles.find((f) => f.relativePath === record.relativePath);
      if (!rawFile) {
        setPreviewCache((prev) => new Map(prev).set(id, '(archivo no encontrado)'));
        return;
      }
      setPreviewLoading(true);
      try {
        const text = await rawFile.file.text();
        setPreviewCache((prev) => new Map(prev).set(id, text));
      } catch {
        setPreviewCache((prev) => new Map(prev).set(id, '(error al leer el archivo)'));
      } finally {
        setPreviewLoading(false);
      }
    },
    [byId, rawFiles, previewCache],
  );

  const closePreview = useCallback(() => setPreviewId(null), []);

  if (isParsing) {
    return (
      <div className={styles.step}>
        <div className={styles.loadingState} aria-live="polite" aria-busy="true">
          <RefreshCw size={32} className={styles.spinIcon} aria-hidden />
          <p>Analizando archivos…</p>
        </div>
      </div>
    );
  }

  if (parseError) {
    return (
      <div className={styles.step}>
        <div className={styles.errorState} role="alert">
          <AlertTriangle size={24} className={styles.errorIcon} aria-hidden />
          <p className={styles.errorMessage}>{parseError}</p>
          <Button variant="secondary" onClick={() => runParse()}>
            <RefreshCw size={16} aria-hidden />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className={styles.step}>
        <div className={styles.emptyState} aria-live="polite">
          <p>No se encontraron archivos .cho o .chor para revisar.</p>
        </div>
      </div>
    );
  }

  const previewRecord = previewId ? byId[previewId] : null;
  const previewContent = previewId ? (previewCache.get(previewId) ?? null) : null;
  const previewTitle = previewRecord
    ? `${previewRecord.title} — ${previewRecord.versionLabel}`
    : '';

  return (
    <div className={styles.step}>
      <header className={styles.intro}>
        <h2 className={styles.heading}>Revisión</h2>
        <p className={styles.note}>
          Revisá y ajustá cada versión antes de importar. Los cambios se guardan en el momento.
        </p>
      </header>

      <div className={styles.counter} aria-live="polite" aria-atomic="true">
        <span className={styles.counterLabel}>Listos para importar:</span>
        <span className={styles.counterValue}>{readyCount}</span>
        <span className={styles.counterSub}>
          de {summary.total} ({summary.review} a revisar, {summary.discard} descartados)
        </span>
      </div>

      <div
        className={styles.tableWrapper}
        role="region"
        aria-label="Tabla de revisión de versiones"
      >
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.thChevron} aria-label="Expandir/colapsar" />
              <th className={styles.th}>Canción</th>
              <th className={styles.th}>Versiones</th>
              <th className={styles.th}>Estado grupo</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const isExpanded = expanded.has(group.songKey);
              return [
                <tr
                  key={`group-${group.songKey}`}
                  className={styles.groupRow}
                  onClick={() => toggleGroup(group.songKey)}
                  aria-expanded={isExpanded}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGroup(group.songKey);
                    }
                  }}
                >
                  <td className={styles.tdChevron}>
                    <span className={styles.chevronBtn} aria-hidden>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </span>
                  </td>
                  <td className={styles.tdTitle}>
                    <span className={styles.songTitle}>{group.songTitle}</span>
                  </td>
                  <td className={styles.tdVersionCount}>
                    <Badge variant="default">{group.versionIds.length}</Badge>
                  </td>
                  <td className={styles.tdAggStatus}>
                    <Badge variant={statusBadgeVariant(group.aggregateStatus)}>
                      {IMPORT_VERSION_STATUS_LABELS[group.aggregateStatus]}
                    </Badge>
                  </td>
                </tr>,

                ...(isExpanded
                  ? [
                      <tr key={`vhead-${group.songKey}`} className={styles.versionHeaderRow}>
                        <td />
                        <th className={styles.vth} scope="col">
                          Versión / Título
                        </th>
                        <th className={styles.vth} scope="col">
                          Tipo / Instrumento / Dificultad
                        </th>
                        <th className={styles.vth} scope="col">
                          Revisión / Destino / Avisos
                        </th>
                      </tr>,

                      ...group.versionIds.map((id) => {
                        const record = byId[id];
                        if (!record) return null;

                        return (
                          <tr key={`ver-${id}`} className={styles.versionRow}>
                            <td className={styles.vIndent} />
                            <td className={styles.vTitleCell}>
                              <span className={styles.versionLabel}>{record.versionLabel}</span>
                              <input
                                type="text"
                                className={styles.titleInput}
                                defaultValue={record.title}
                                aria-label={`Título de ${record.versionLabel}`}
                                onBlur={(e) => updateRecord(id, { title: e.currentTarget.value })}
                              />
                            </td>

                            <td className={styles.vMetaCell}>
                              <span className={styles.metaLabel}>
                                {TAB_TYPE_LABELS[record.tabType]}
                              </span>
                              <Select
                                className={styles.inlineSelect}
                                options={INSTRUMENT_OPTIONS}
                                value={record.instrument}
                                onChange={(v) => updateRecord(id, { instrument: v as Instrument })}
                                aria-label={`Instrumento de ${record.versionLabel}`}
                              />
                              <Select
                                className={styles.inlineSelect}
                                options={DIFFICULTY_OPTIONS}
                                value={record.difficulty}
                                onChange={(v) => updateRecord(id, { difficulty: v as Difficulty })}
                                aria-label={`Dificultad de ${record.versionLabel}`}
                              />
                            </td>

                            <td className={styles.vStatusCell}>
                              <Select
                                className={styles.inlineSelect}
                                options={STATUS_OPTIONS}
                                value={record.status}
                                onChange={(v) =>
                                  updateRecord(id, { status: v as ImportVersionStatus })
                                }
                                aria-label={`Estado de revisión de ${record.versionLabel}`}
                              />
                              <span className={styles.targetStatusLabel}>
                                {TAB_STATUS_LABELS[record.targetStatus]}
                              </span>
                              {record.warnings.length > 0 && (
                                <span className={styles.warningsCount} title="Avisos">
                                  <AlertTriangle size={14} aria-hidden />
                                  {record.warnings.length}
                                </span>
                              )}
                              <button
                                type="button"
                                className={styles.previewBtn}
                                aria-label={`Vista previa de ${record.title} ${record.versionLabel}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPreview(id);
                                }}
                              >
                                <Eye size={18} aria-hidden />
                              </button>
                            </td>
                          </tr>
                        );
                      }),
                    ]
                  : []),
              ];
            })}
          </tbody>
        </table>
      </div>

      {previewRecord && (
        <Modal
          open={previewId !== null}
          onOpenChange={(open) => {
            if (!open) closePreview();
          }}
          title={previewTitle}
          maxWidth={720}
        >
          {previewLoading ? (
            <div className={styles.previewLoading} aria-live="polite" aria-busy="true">
              <RefreshCw size={24} className={styles.spinIcon} aria-hidden />
              <p>Cargando…</p>
            </div>
          ) : (
            <pre className={styles.previewPre}>{previewContent ?? ''}</pre>
          )}
        </Modal>
      )}
    </div>
  );
}
