import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAdminSongs, createSong, updateSong, deleteSong } from './songs.api';
import type { ListAdminSongsParams } from './songs.api';
import type { UpdateSongInput } from './songs.types';

const ADMIN_SONGS_KEY = ['admin', 'songs'] as const;

export function useAdminSongs(params?: ListAdminSongsParams) {
  return useQuery({
    queryKey: [...ADMIN_SONGS_KEY, params],
    queryFn: () => listAdminSongs(params),
  });
}

export function useCreateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SONGS_KEY });
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSongInput }) => updateSong(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SONGS_KEY });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SONGS_KEY });
    },
  });
}
