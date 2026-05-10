import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listAdminArtists,
  listAllArtists,
  createArtist,
  updateArtist,
  deleteArtist,
} from './artists.api';
import type { ListAdminArtistsParams } from './artists.api';
import type { ArtistSelectOption, UpdateArtistInput } from './artists.types';

const ADMIN_ARTISTS_LIST_KEY = ['admin', 'artists', 'list'] as const;
const ADMIN_ARTISTS_ALL_KEY = ['admin', 'artists', 'all'] as const;

export function useAdminArtists(params?: ListAdminArtistsParams) {
  return useQuery({
    queryKey: [...ADMIN_ARTISTS_LIST_KEY, params],
    queryFn: () => listAdminArtists(params),
  });
}

export function useArtistSelectOptions() {
  return useQuery({
    queryKey: ADMIN_ARTISTS_ALL_KEY,
    queryFn: async (): Promise<ArtistSelectOption[]> => {
      const artists = await listAllArtists();

      return artists.map((artist) => ({
        value: artist.id,
        label: artist.name,
      }));
    },
  });
}

export function useCreateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ARTISTS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_ARTISTS_ALL_KEY });
    },
  });
}

export function useUpdateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArtistInput }) => updateArtist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ARTISTS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_ARTISTS_ALL_KEY });
    },
  });
}

export function useDeleteArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ARTISTS_LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_ARTISTS_ALL_KEY });
    },
  });
}
