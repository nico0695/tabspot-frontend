import type { FieldConfig } from '@/components/crud/FormBuilder';
import type { GenreFormData } from '@/features/admin/genres/genres.schema';
import type { GenreFormModalMode } from '@/features/admin/genres/genres.types';

export const MODAL_TITLES: Record<GenreFormModalMode, string> = {
  create: 'Crear género',
  edit: 'Editar género',
  detail: 'Detalle del género',
  delete: 'Eliminar género',
};

export const FORM_FIELDS: FieldConfig<GenreFormData>[] = [
  { name: 'name', type: 'text', label: 'Nombre', placeholder: 'Ej: Rock' },
];
