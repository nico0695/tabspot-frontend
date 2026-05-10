import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listAdminGenres,
  listAllGenres,
  createGenre,
  updateGenre,
  deleteGenre,
} from './genres.api';
import type { ListAdminGenresParams } from './genres.api';
import type { GenreSelectOption, UpdateGenreInput } from './genres.types';

const ADMIN_GENRES_LIST_KEY = ['admin', 'genres', 'list'] as const;
const ADMIN_GENRES_ALL_KEY = ['admin', 'genres', 'all'] as const;

export function useAdminGenres(params?: ListAdminGenresParams) {
  return useQuery({
    queryKey: [...ADMIN_GENRES_LIST_KEY, params],
    queryFn: () => listAdminGenres(params),
  });
}

export function useGenreSelectOptions() {
  return useQuery({
    queryKey: ADMIN_GENRES_ALL_KEY,
    queryFn: async (): Promise<GenreSelectOption[]> => {
      const genres = await listAllGenres();

      return genres.map((genre) => ({
        value: genre.id,
        label: genre.name,
      }));
    },
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_ALL_KEY });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGenreInput }) => updateGenre(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_ALL_KEY });
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_ALL_KEY });
    },
  });
}
