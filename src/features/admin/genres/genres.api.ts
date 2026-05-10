import { apiClient } from '@/lib/api/client';
import type { OffsetPage } from '@/lib/api/types';
import type { AdminGenre, CreateGenreInput, UpdateGenreInput } from './genres.types';

const BASE_PATH = '/api/v1/admin/genres';

export interface ListAdminGenresParams {
  page?: number;
  pageSize?: number;
  q?: string;
  includeDeleted?: boolean;
}

export function listAdminGenres(params?: ListAdminGenresParams): Promise<OffsetPage<AdminGenre>> {
  const searchParams = new URLSearchParams();

  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.pageSize != null) searchParams.set('pageSize', String(params.pageSize));
  if (params?.q) searchParams.set('q', params.q);
  if (params?.includeDeleted) searchParams.set('includeDeleted', 'true');

  const qs = searchParams.toString();
  const path = qs ? `${BASE_PATH}?${qs}` : BASE_PATH;

  return apiClient.get<OffsetPage<AdminGenre>>(path);
}

export function getAdminGenre(id: string): Promise<AdminGenre> {
  return apiClient.get<AdminGenre>(`${BASE_PATH}/${id}`);
}

export function createGenre(data: CreateGenreInput): Promise<AdminGenre> {
  return apiClient.post<AdminGenre>(BASE_PATH, data);
}

export function updateGenre(id: string, data: UpdateGenreInput): Promise<AdminGenre> {
  return apiClient.patch<AdminGenre>(`${BASE_PATH}/${id}`, data);
}

export function deleteGenre(id: string): Promise<void> {
  return apiClient.delete(`${BASE_PATH}/${id}`);
}
