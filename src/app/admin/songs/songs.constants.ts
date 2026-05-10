import type { SongFormModalMode } from '@/features/admin/songs/songs.types';

export const MODAL_TITLES: Record<SongFormModalMode, string> = {
  create: 'Crear canción',
  edit: 'Editar canción',
  detail: 'Detalle de la canción',
  delete: 'Eliminar canción',
};
