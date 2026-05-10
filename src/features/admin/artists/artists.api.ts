import { apiClient } from '@/lib/api/client';
import type { OffsetPage } from '@/lib/api/types';
import type { AdminArtist, CreateArtistInput, UpdateArtistInput } from './artists.types';

const BASE_PATH = '/api/v1/admin/artists';

export interface ListAdminArtistsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  includeDeleted?: boolean;
}

export function listAdminArtists(
  params?: ListAdminArtistsParams,
): Promise<OffsetPage<AdminArtist>> {
  const searchParams = new URLSearchParams();

  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.pageSize != null) searchParams.set('pageSize', String(params.pageSize));
  if (params?.q) searchParams.set('q', params.q);
  if (params?.includeDeleted) searchParams.set('includeDeleted', 'true');

  const qs = searchParams.toString();
  const path = qs ? `${BASE_PATH}?${qs}` : BASE_PATH;

  return apiClient.get<OffsetPage<AdminArtist>>(path);
}

export function getAdminArtist(id: string): Promise<AdminArtist> {
  return apiClient.get<AdminArtist>(`${BASE_PATH}/${id}`);
}

export function createArtist(data: CreateArtistInput): Promise<AdminArtist> {
  return apiClient.post<AdminArtist>(BASE_PATH, data);
}

export function updateArtist(id: string, data: UpdateArtistInput): Promise<AdminArtist> {
  return apiClient.patch<AdminArtist>(`${BASE_PATH}/${id}`, data);
}

export function deleteArtist(id: string): Promise<void> {
  return apiClient.delete(`${BASE_PATH}/${id}`);
}
