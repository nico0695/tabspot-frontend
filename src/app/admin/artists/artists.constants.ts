import type { FieldConfig } from '@/components/crud/FormBuilder';
import type { ArtistFormData } from '@/features/admin/artists/artists.schema';
import type { ArtistFormModalMode } from '@/features/admin/artists/artists.types';

export const MODAL_TITLES: Record<ArtistFormModalMode, string> = {
  create: 'Crear artista',
  edit: 'Editar artista',
  detail: 'Detalle del artista',
  delete: 'Eliminar artista',
};

export const FORM_FIELDS: FieldConfig<ArtistFormData>[] = [
  { name: 'name', type: 'text', label: 'Nombre', placeholder: 'Ej: Soda Stereo' },
  {
    name: 'sortName',
    type: 'text',
    label: 'Nombre de orden',
    placeholder: 'Ej: Soda Stereo',
    hint: 'Nombre para ordenamiento alfabético',
  },
];
