import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAdminSongs, listAllSongs, createSong, updateSong, deleteSong } from './songs.api';
import type { ListAdminSongsParams } from './songs.api';
import type { UpdateSongInput } from './songs.types';
import type { SelectOption } from '@/components/ui/Select';

const ADMIN_SONGS_KEY = ['admin', 'songs'] as const;
const ADMIN_SONGS_ALL_KEY = ['admin', 'songs', 'all'] as const;

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

export function useSongSelectOptions() {
  return useQuery({
    queryKey: ADMIN_SONGS_ALL_KEY,
    queryFn: async (): Promise<SelectOption[]> => {
      const songs = await listAllSongs();
      return songs.map((song) => ({
        value: song.id,
        label: song.title,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
