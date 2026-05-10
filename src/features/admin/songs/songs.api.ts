import { apiClient } from '@/lib/api/client';
import type { OffsetPage } from '@/lib/api/types';
import type { AdminSong, CreateSongInput, UpdateSongInput } from './songs.types';

const BASE_PATH = '/api/v1/admin/songs';

export interface ListAdminSongsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  artistId?: string;
  includeDeleted?: boolean;
}

export function listAdminSongs(params?: ListAdminSongsParams): Promise<OffsetPage<AdminSong>> {
  const searchParams = new URLSearchParams();

  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.pageSize != null) searchParams.set('pageSize', String(params.pageSize));
  if (params?.q) searchParams.set('q', params.q);
  if (params?.artistId) searchParams.set('artistId', params.artistId);
  if (params?.includeDeleted) searchParams.set('includeDeleted', 'true');

  const qs = searchParams.toString();
  const path = qs ? `${BASE_PATH}?${qs}` : BASE_PATH;

  return apiClient.get<OffsetPage<AdminSong>>(path);
}

export function getAdminSong(id: string): Promise<AdminSong> {
  return apiClient.get<AdminSong>(`${BASE_PATH}/${id}`);
}

export function createSong(data: CreateSongInput): Promise<AdminSong> {
  return apiClient.post<AdminSong>(BASE_PATH, data);
}

export function updateSong(id: string, data: UpdateSongInput): Promise<AdminSong> {
  return apiClient.patch<AdminSong>(`${BASE_PATH}/${id}`, data);
}

export function deleteSong(id: string): Promise<void> {
  return apiClient.delete(`${BASE_PATH}/${id}`);
}
