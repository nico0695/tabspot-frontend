import type { SelectOption } from '@/components/ui/Select';

export const MODAL_TITLES: Record<string, string> = {
  create: 'Crear tab',
  edit: 'Editar tab',
  detail: 'Detalle de tab',
  delete: 'Eliminar tab',
};

export const TAB_TYPE_OPTIONS: SelectOption[] = [
  { value: 'CHORDS', label: 'Chords' },
  { value: 'TAB', label: 'Tab' },
  { value: 'MIXED', label: 'Mixed' },
];

export const INSTRUMENT_OPTIONS: SelectOption[] = [
  { value: 'GUITAR', label: 'Guitar' },
  { value: 'BASS', label: 'Bass' },
  { value: 'UKULELE', label: 'Ukulele' },
  { value: 'PIANO', label: 'Piano' },
];

export const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export const STATUS_OPTIONS: SelectOption[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const STATUS_VARIANT: Record<string, 'default' | 'pending' | 'published' | 'rejected'> = {
  DRAFT: 'default',
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
};
