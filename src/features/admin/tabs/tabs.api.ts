import { apiClient } from '@/lib/api/client';
import type { OffsetPage } from '@/lib/api/types';
import type { AdminTab, CreateTabInput, UpdateTabInput } from './tabs.types';

const BASE_PATH = '/api/v1/admin/tabs';

export interface ListAdminTabsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  includeDeleted?: boolean;
}

export function listAdminTabs(params?: ListAdminTabsParams): Promise<OffsetPage<AdminTab>> {
  const searchParams = new URLSearchParams();

  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.pageSize != null) searchParams.set('pageSize', String(params.pageSize));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.includeDeleted) searchParams.set('includeDeleted', 'true');

  const qs = searchParams.toString();
  const path = qs ? `${BASE_PATH}?${qs}` : BASE_PATH;

  return apiClient.get<OffsetPage<AdminTab>>(path);
}

export function getAdminTab(id: string): Promise<AdminTab> {
  return apiClient.get<AdminTab>(`${BASE_PATH}/${id}`);
}

export function createTab(data: CreateTabInput): Promise<AdminTab> {
  return apiClient.post<AdminTab>(BASE_PATH, data);
}

export function updateTab(id: string, data: UpdateTabInput): Promise<AdminTab> {
  return apiClient.patch<AdminTab>(`${BASE_PATH}/${id}`, data);
}

export function deleteTab(id: string): Promise<void> {
  return apiClient.delete(`${BASE_PATH}/${id}`);
}
