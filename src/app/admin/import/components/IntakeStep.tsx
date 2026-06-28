'use client';

import { useRef, useState, useMemo } from 'react';
import { FolderOpen, FileText, AlertTriangle, X, Upload, FolderInput } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useImportWizardStore } from '@/features/admin/import/import.store';
import {
  folderAdapter,
  looseAdapter,
  filterFiles,
  findOverLimitSongs,
} from '@/features/admin/import/intake';
import styles from './IntakeStep.module.css';

interface RejectedFile {
  fileName: string;
  relativePath: string;
  reason: string;
}

export function IntakeStep() {
  const rawFiles = useImportWizardStore((s) => s.rawFiles);
  const addRawFiles = useImportWizardStore((s) => s.addRawFiles);
  const maxVersions = useImportWizardStore((s) => s.maxVersions);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const looseInputRef = useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const [rejectedDismissed, setRejectedDismissed] = useState(false);

  const overLimitSongs = useMemo(
    () => findOverLimitSongs(rawFiles, maxVersions),
    [rawFiles, maxVersions],
  );

  const summary = useMemo(() => {
    let versions = 0;
    let metadata = 0;
    for (const f of rawFiles) {
      if (f.kind === 'cho' || f.kind === 'chor') versions += 1;
      else if (f.kind === 'log') metadata += 1;
    }
    const songKeys = new Set(
      rawFiles
        .filter((f) => f.kind === 'cho' || f.kind === 'chor')
        .map((f) => {
          const parts = f.relativePath.split('/');
          if (parts.length >= 2) return parts[parts.length - 2];
          const base = parts[0].replace(/\.[^.]+$/, '');
          return base.replace(/-\d+$/, '');
        }),
    );
    return { total: rawFiles.length, versions, songs: songKeys.size, metadata };
  }, [rawFiles]);

  async function handleIntake(source: DataTransfer | FileList, adapter: typeof folderAdapter) {
    try {
      const collected = await adapter.collect(source);
      const { accepted, rejected: newRejected } = filterFiles(collected);
      if (accepted.length > 0) addRawFiles(accepted);
      if (newRejected.length > 0) {
        setRejected((prev) => {
          const existingPaths = new Set(prev.map((r) => r.relativePath));
          const unique = newRejected.filter((r) => !existingPaths.has(r.relativePath));
          return unique.length > 0 ? [...prev, ...unique] : prev;
        });
        setRejectedDismissed(false);
      }
    } catch (err) {
      console.error('[IntakeStep] intake error', err);
    }
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    // only reset if truly leaving the drop zone (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    handleIntake(e.dataTransfer, folderAdapter);
  }

  function onFolderChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    handleIntake(e.target.files, folderAdapter);
    // Reset so the same folder can be re-selected
    e.target.value = '';
  }

  function onLooseChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    handleIntake(e.target.files, looseAdapter);
    e.target.value = '';
  }

  const hasFiles = rawFiles.length > 0;
  const showRejected = rejected.length > 0 && !rejectedDismissed;
  const showOverLimit = overLimitSongs.size > 0;

  return (
    <div className={styles.step}>
      <header className={styles.intro}>
        <h2 className={styles.heading}>Archivos de importación</h2>
        <p className={styles.note}>
          Arrastrá una carpeta, seleccioná un directorio o elegí archivos sueltos (.cho / .chor).
        </p>
      </header>

      <div
        className={isDragOver ? `${styles.dropZone} ${styles.dropZoneActive}` : styles.dropZone}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="region"
        aria-label="Zona de arrastrar y soltar archivos"
      >
        <Upload size={32} className={styles.dropZoneIcon} aria-hidden />
        <p className={styles.dropZoneTitle}>
          {isDragOver ? 'Soltá aquí' : 'Arrastrá una carpeta aquí'}
        </p>
        <p className={styles.dropZoneSub}>o usá los botones de abajo para explorar</p>
      </div>

      <div className={styles.pickerRow}>
        <Button
          variant="secondary"
          className={styles.pickerBtn}
          onClick={() => folderInputRef.current?.click()}
        >
          <FolderInput size={18} aria-hidden />
          Seleccionar carpeta
        </Button>
        <Button
          variant="secondary"
          className={styles.pickerBtn}
          onClick={() => looseInputRef.current?.click()}
        >
          <FileText size={18} aria-hidden />
          Archivos sueltos
        </Button>

        <input
          ref={folderInputRef}
          type="file"
          /* @ts-expect-error — webkitdirectory is not in React's HTMLInputElement types */
          webkitdirectory=""
          multiple
          className={styles.hiddenInput}
          onChange={onFolderChange}
          aria-hidden="true"
          tabIndex={-1}
        />
        <input
          ref={looseInputRef}
          type="file"
          multiple
          accept=".cho,.chor"
          className={styles.hiddenInput}
          onChange={onLooseChange}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {hasFiles ? (
        <div className={styles.summary} aria-live="polite" aria-atomic="true">
          <span className={styles.summaryStat}>
            <span className={styles.summaryCount}>{summary.versions}</span>
            {summary.versions === 1 ? 'versión' : 'versiones'}
          </span>
          <span className={styles.summaryDivider} aria-hidden />
          <span className={styles.summaryStat}>
            <span className={styles.summaryCount}>{summary.songs}</span>
            {summary.songs === 1 ? 'canción' : 'canciones'}
          </span>
          {summary.metadata > 0 && (
            <>
              <span className={styles.summaryDivider} aria-hidden />
              <span className={styles.summaryStat}>
                <span className={styles.summaryCount}>{summary.metadata}</span>
                {summary.metadata === 1 ? 'metadato (.log)' : 'metadatos (.log)'}
              </span>
            </>
          )}
        </div>
      ) : (
        <div className={styles.emptyState} aria-live="polite">
          <FolderOpen size={40} className={styles.emptyIcon} aria-hidden />
          <p>No hay archivos cargados. Arrastrá una carpeta o usá los botones.</p>
        </div>
      )}

      {showOverLimit && (
        <div className={styles.warningBanner} role="alert" aria-live="polite">
          <AlertTriangle size={18} className={styles.warningIcon} aria-hidden />
          <div className={styles.warningContent}>
            <p className={styles.warningTitle}>
              Algunas canciones superan el límite de {maxVersions} versiones
            </p>
            <ul className={styles.warningList}>
              {Array.from(overLimitSongs.entries()).map(([key, count]) => (
                <li key={key}>
                  <strong>{key}</strong> — {count} versiones
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showRejected && (
        <div className={styles.rejectedPanel} role="alert">
          <div className={styles.rejectedHeader}>
            <span className={styles.rejectedTitle}>
              <X size={14} aria-hidden />
              {rejected.length} {rejected.length === 1 ? 'archivo ignorado' : 'archivos ignorados'}
            </span>
            <button
              type="button"
              className={styles.dismissBtn}
              onClick={() => setRejectedDismissed(true)}
              aria-label="Cerrar panel de archivos ignorados"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          <ul className={styles.rejectedList}>
            {rejected.map((r) => (
              <li key={r.relativePath} className={styles.rejectedItem}>
                <span className={styles.rejectedFileName}>{r.fileName}</span>
                <span className={styles.rejectedReason}>— {r.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
