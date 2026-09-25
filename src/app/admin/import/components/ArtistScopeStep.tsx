'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { FormBuilder, type FieldConfig } from '@/components/crud/FormBuilder';
import { showToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api';
import { useArtistSelectOptions, useCreateArtist } from '@/features/admin/artists/artists.hooks';
import { artistFormSchema, type ArtistFormData } from '@/features/admin/artists/artists.schema';
import { useImportWizardStore } from '@/features/admin/import/import.store';
import {
  DIFFICULTY_LABELS,
  INSTRUMENT_LABELS,
  TAB_STATUS_LABELS,
} from '@/features/admin/import/import.constants';
import type { Difficulty, Instrument, TabStatus } from '@/lib/api/enums';
import styles from './ArtistScopeStep.module.css';

const CREATE_ARTIST_FIELDS: FieldConfig<ArtistFormData>[] = [
  { name: 'name', type: 'text', label: 'Nombre', placeholder: 'Ej: Soda Stereo' },
  {
    name: 'sortName',
    type: 'text',
    label: 'Nombre de orden',
    placeholder: 'Ej: Soda Stereo',
    hint: 'Opcional — para ordenamiento alfabético',
  },
];

function toOptions<T extends string>(labels: Record<T, string>): SelectOption[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));
}

export function ArtistScopeStep() {
  const artist = useImportWizardStore((s) => s.artist);
  const defaults = useImportWizardStore((s) => s.defaults);
  const setArtist = useImportWizardStore((s) => s.setArtist);
  const setDefaults = useImportWizardStore((s) => s.setDefaults);

  const optionsQuery = useArtistSelectOptions();
  const createMutation = useCreateArtist();

  const [createOpen, setCreateOpen] = useState(false);

  const artistOptions = optionsQuery.data ?? [];

  const statusOptions = useMemo(() => toOptions(TAB_STATUS_LABELS), []);
  const difficultyOptions = useMemo(() => toOptions(DIFFICULTY_LABELS), []);
  const instrumentOptions = useMemo(() => toOptions(INSTRUMENT_LABELS), []);

  const handleSelectArtist = (id: string) => {
    const option = artistOptions.find((o) => o.value === id);
    if (!option) return;
    setArtist({ id: option.value, name: option.label });
  };

  const handleCreateArtist = async (data: ArtistFormData) => {
    try {
      const created = await createMutation.mutateAsync({
        name: data.name,
        sortName: data.sortName ? data.sortName : undefined,
      });
      setArtist({ id: created.id, name: created.name });
      setCreateOpen(false);
      showToast.success('Artista creado');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.userMessage : 'Error inesperado al crear el artista';
      showToast.error(message);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h3>Artista de la importación</h3>
      </Card.Header>
      <Card.Description>
        Todas las versiones de esta importación se asignarán a este artista.
      </Card.Description>
      <Card.Body className={styles.body}>
        <section className={styles.section}>
          <span className={styles.sectionLabel}>Seleccionar artista existente</span>
          <div className={styles.artistRow}>
            <Select
              className={styles.artistSelect}
              options={artistOptions}
              value={artist?.id}
              onChange={handleSelectArtist}
              placeholder={optionsQuery.isLoading ? 'Cargando artistas…' : 'Elegí un artista'}
              disabled={optionsQuery.isLoading}
            />
            <Button
              variant="secondary"
              className={styles.createBtn}
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={18} />
              Crear artista
            </Button>
          </div>
          {optionsQuery.isError && (
            <p className={styles.errorText} role="alert">
              No se pudieron cargar los artistas.
            </p>
          )}
          <div className={styles.selectedRow} aria-live="polite">
            <span className={styles.sectionLabel}>Artista:</span>
            {artist ? (
              <Badge variant="published">{artist.name}</Badge>
            ) : (
              <Badge variant="default">Sin seleccionar</Badge>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.sectionLabel}>Valores por defecto de la importación</span>
          <p className={styles.note}>
            Se aplicarán a cada versión; podrás ajustarlos por versión en la revisión.
          </p>
          <div className={styles.defaultsGrid}>
            <Select
              label="Estado"
              options={statusOptions}
              value={defaults.status}
              onChange={(value) => setDefaults({ status: value as TabStatus })}
            />
            <Select
              label="Dificultad"
              options={difficultyOptions}
              value={defaults.difficulty}
              onChange={(value) => setDefaults({ difficulty: value as Difficulty })}
            />
            <Select
              label="Instrumento"
              options={instrumentOptions}
              value={defaults.instrument}
              onChange={(value) => setDefaults({ instrument: value as Instrument })}
            />
          </div>
        </section>

        <Modal open={createOpen} onOpenChange={setCreateOpen} title="Crear artista" maxWidth={480}>
          <FormBuilder<ArtistFormData>
            schema={artistFormSchema}
            fields={CREATE_ARTIST_FIELDS}
            onSubmit={handleCreateArtist}
            loading={createMutation.isPending}
            submitLabel="Crear"
          />
        </Modal>
      </Card.Body>
    </Card>
  );
}
