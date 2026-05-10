import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAdminUsers, changeUserRole, changeUserStatus } from './users.api';
import type { ListAdminUsersParams } from './users.api';
import type { ChangeRoleInput, ChangeStatusInput } from './users.types';

const ADMIN_USERS_KEY = ['admin', 'users'] as const;

export function useAdminUsers(params?: ListAdminUsersParams) {
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, params],
    queryFn: () => listAdminUsers(params),
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeRoleInput }) => changeUserRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

export function useChangeUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangeStatusInput }) =>
      changeUserStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}
