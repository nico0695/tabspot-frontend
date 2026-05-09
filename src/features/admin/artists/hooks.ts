import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAdminArtists, createArtist, updateArtist, deleteArtist } from './api';
import type { ListAdminArtistsParams } from './api';
import type { UpdateArtistInput } from './types';

const ADMIN_ARTISTS_KEY = ['admin', 'artists'] as const;

export function useAdminArtists(params?: ListAdminArtistsParams) {
  return useQuery({
    queryKey: [...ADMIN_ARTISTS_KEY, params],
    queryFn: () => listAdminArtists(params),
  });
}

export function useCreateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ARTISTS_KEY });
    },
  });
}

export function useUpdateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArtistInput }) => updateArtist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ARTISTS_KEY });
    },
  });
}

export function useDeleteArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ARTISTS_KEY });
    },
  });
}
