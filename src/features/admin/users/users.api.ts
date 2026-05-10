import { apiClient } from '@/lib/api/client';
import type { OffsetPage } from '@/lib/api/types';
import type { AdminUser, ChangeRoleInput, ChangeStatusInput } from './users.types';

const BASE_PATH = '/api/v1/admin/users';

export interface ListAdminUsersParams {
  page?: number;
  pageSize?: number;
  role?: string;
  status?: string;
}

export function listAdminUsers(params?: ListAdminUsersParams): Promise<OffsetPage<AdminUser>> {
  const searchParams = new URLSearchParams();

  if (params?.page != null) searchParams.set('page', String(params.page));
  if (params?.pageSize != null) searchParams.set('pageSize', String(params.pageSize));
  if (params?.role) searchParams.set('role', params.role);
  if (params?.status) searchParams.set('status', params.status);

  const qs = searchParams.toString();
  const path = qs ? `${BASE_PATH}?${qs}` : BASE_PATH;

  return apiClient.get<OffsetPage<AdminUser>>(path);
}

export function changeUserRole(id: string, data: ChangeRoleInput): Promise<AdminUser> {
  return apiClient.patch<AdminUser>(`${BASE_PATH}/${id}/role`, data);
}

export function changeUserStatus(id: string, data: ChangeStatusInput): Promise<AdminUser> {
  return apiClient.patch<AdminUser>(`${BASE_PATH}/${id}/status`, data);
}
