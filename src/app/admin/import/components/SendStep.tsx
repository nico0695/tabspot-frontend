'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Pause, Play, RotateCcw, Send, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useBulkSend } from '@/features/admin/import/import.hooks';
import { useImportWizardStore } from '@/features/admin/import/import.store';
import { selectReadyCount } from '@/features/admin/import/import.selectors';
import type {
  BulkImportSongResult,
  SendError,
  SendProgress,
} from '@/features/admin/import/import.types';
import styles from './SendStep.module.css';

function songStatusVariant(status: BulkImportSongResult['songStatus']): 'published' | 'default' {
  return status === 'created' ? 'published' : 'default';
}

function ErrorList({ errors, label }: { errors: SendError[]; label: string }) {
  return (
    <ul className={styles.errorList} aria-label={label}>
      {errors.map((error, index) => (
        <li key={`${error.code}-${error.songIndex}-${index}`} className={styles.errorItem}>
          <span className={styles.errorIndex}>#{error.songIndex}</span>
          <span className={styles.errorTitle}>{error.title || '—'}</span>
          <span className={styles.errorCode}>{error.code}</span>
          <span className={styles.errorMessage}>{error.message}</span>
          {error.fields && error.fields.length > 0 && (
            <ul className={styles.fieldErrorList} aria-label="Errores por campo">
              {error.fields.map((field, fieldIndex) => (
                <li key={`${field.field}-${fieldIndex}`} className={styles.fieldErrorItem}>
                  <span className={styles.fieldErrorField}>{field.field}</span>
                  <span className={styles.fieldErrorSeparator}>:</span>
                  <span className={styles.fieldErrorMessage}>{field.message}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function ProgressPanel({
  progress,
  busy,
  children,
}: {
  progress: SendProgress;
  busy: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.progressSection} aria-live="polite" aria-busy={busy}>
      <div className={styles.progressRow}>
        {busy && <Spinner size="sm" />}
        <div className={styles.progressText}>
          <span>
            Lote {progress.batch} de {progress.totalBatches}
          </span>
          <span>
            Canciones enviadas: {progress.sent} de {progress.totalSongs}
          </span>
        </div>
      </div>
      {progress.errors.length > 0 && (
        <ErrorList errors={progress.errors} label="Errores de envío" />
      )}
      <div className={styles.buttonRow}>{children}</div>
    </div>
  );
}

export function SendStep() {
  const readyCount = useImportWizardStore((s) => selectReadyCount(s.summary));
  const sendStatus = useImportWizardStore((s) => s.sendStatus);
  const sendProgress = useImportWizardStore((s) => s.sendProgress);
  const sendResult = useImportWizardStore((s) => s.sendResult);
  const resetSend = useImportWizardStore((s) => s.resetSend);

  const { startSend, pauseSend, resumeSend, cancelSend, retrySend } = useBulkSend();

  const lastError = sendProgress.errors[sendProgress.errors.length - 1] ?? null;

  return (
    <Card>
      <Card.Header>
        <h3>Envío</h3>
      </Card.Header>
      <Card.Description>
        Enviá las versiones aptas al catálogo. El envío se procesa por lotes y podés pausarlo o
        reintentarlo.
      </Card.Description>
      <Card.Body className={styles.body}>
        {sendStatus === 'idle' && (
          <>
            <p className={styles.readyCount}>
              Listos para importar: <strong>{readyCount}</strong>
            </p>
            <div className={styles.buttonRow}>
              <Button
                variant="primary"
                className={styles.sendButton}
                onClick={() => void startSend()}
              >
                <Send size={16} aria-hidden />
                Enviar
              </Button>
            </div>
            <p className={styles.note}>
              Podés pausar y reanudar el envío entre lotes una vez iniciado.
            </p>
          </>
        )}

        {sendStatus === 'running' && (
          <ProgressPanel progress={sendProgress} busy>
            <Button variant="secondary" onClick={pauseSend}>
              <Pause size={16} aria-hidden />
              Pausar
            </Button>
            <Button variant="danger-ghost" onClick={cancelSend}>
              <XCircle size={16} aria-hidden />
              Cancelar
            </Button>
          </ProgressPanel>
        )}

        {sendStatus === 'paused' && (
          <ProgressPanel progress={sendProgress} busy={false}>
            <Button variant="primary" onClick={() => void resumeSend()}>
              <Play size={16} aria-hidden />
              Reanudar
            </Button>
            <Button variant="danger-ghost" onClick={cancelSend}>
              <XCircle size={16} aria-hidden />
              Cancelar
            </Button>
          </ProgressPanel>
        )}

        {sendStatus === 'error' && (
          <div className={styles.errorState} role="alert">
            <div className={styles.errorAlert}>
              <AlertTriangle size={20} className={styles.errorAlertIcon} aria-hidden />
              <p className={styles.errorMessage}>
                {lastError?.message || 'Ocurrió un error durante el envío.'}
              </p>
            </div>
            {sendProgress.errors.length > 0 && (
              <ErrorList errors={sendProgress.errors} label="Errores de envío" />
            )}
            <div className={styles.buttonRow}>
              <Button variant="primary" onClick={() => void retrySend()}>
                <RotateCcw size={16} aria-hidden />
                Reintentar
              </Button>
              <Button variant="secondary" onClick={cancelSend}>
                <XCircle size={16} aria-hidden />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {sendStatus === 'done' && sendResult && (
          <div className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <CheckCircle2 size={20} className={styles.resultsIcon} aria-hidden />
              <h4 className={styles.sectionTitle}>Resultado del envío</h4>
            </div>

            <div className={styles.resultsSummary}>
              <div className={styles.resultStat}>
                <span className={styles.resultStatLabel}>Artistas</span>
                <span className={styles.resultStatValue}>{sendResult.inserted.artists}</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatLabel}>Canciones</span>
                <span className={styles.resultStatValue}>{sendResult.inserted.songs}</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatLabel}>Tabs</span>
                <span className={styles.resultStatValue}>{sendResult.inserted.tabs}</span>
              </div>
              <div className={styles.resultStat}>
                <span className={styles.resultStatLabel}>Omitidas</span>
                <span className={styles.resultStatValue}>{sendResult.skipped}</span>
              </div>
            </div>

            {sendResult.results.length > 0 ? (
              <ul className={styles.songResultList} aria-label="Resultados por canción">
                {sendResult.results.map((song, index) => (
                  <li key={`${song.songId}-${index}`} className={styles.songResultItem}>
                    <span className={styles.songResultTitle}>{song.title}</span>
                    <Badge
                      variant={songStatusVariant(song.songStatus)}
                      className={styles.statusBadge}
                    >
                      {song.songStatus}
                    </Badge>
                    <span className={styles.songResultMeta}>
                      {song.tabsInserted} insertadas · {song.tabsSkipped} omitidas
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<CheckCircle2 size={40} aria-hidden />}
                title="Sin canciones procesadas"
                description="No se registraron canciones en este envío."
              />
            )}

            {sendResult.errors.length > 0 && (
              <div className={styles.errorState}>
                <h4 className={styles.sectionTitle}>Errores</h4>
                <ErrorList errors={sendResult.errors} label="Errores de importación" />
              </div>
            )}

            <div className={styles.buttonRow}>
              <Button variant="secondary" onClick={resetSend}>
                <RotateCcw size={16} aria-hidden />
                Nuevo envío
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
