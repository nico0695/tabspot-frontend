import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAdminGenres, createGenre, updateGenre, deleteGenre } from './api';
import type { ListAdminGenresParams } from './api';
import type { UpdateGenreInput } from './types';

const ADMIN_GENRES_KEY = ['admin', 'genres'] as const;

export function useAdminGenres(params?: ListAdminGenresParams) {
  return useQuery({
    queryKey: [...ADMIN_GENRES_KEY, params],
    queryFn: () => listAdminGenres(params),
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_KEY });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGenreInput }) => updateGenre(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_KEY });
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_KEY });
    },
  });
}
