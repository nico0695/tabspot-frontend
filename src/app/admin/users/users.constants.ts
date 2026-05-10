import type { UserActionModalMode } from '@/features/admin/users/users.types';

export const MODAL_TITLES: Record<UserActionModalMode, string> = {
  detail: 'Detalle del usuario',
  'change-role': 'Cambiar rol',
  'change-status': 'Cambiar estado',
};

export const ROLE_OPTIONS = [
  { value: 'USER', label: 'Usuario' },
  { value: 'ADMIN', label: 'Admin' },
];

export const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'BLOCKED', label: 'Bloqueado' },
];

export const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Todos los roles' },
  { value: 'USER', label: 'Usuario' },
  { value: 'ADMIN', label: 'Admin' },
];

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'BLOCKED', label: 'Bloqueado' },
];
