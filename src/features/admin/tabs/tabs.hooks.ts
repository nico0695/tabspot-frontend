import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAdminTabs, createTab, updateTab, deleteTab } from './tabs.api';
import type { ListAdminTabsParams } from './tabs.api';
import type { UpdateTabInput } from './tabs.types';

const ADMIN_TABS_KEY = ['admin', 'tabs'] as const;

export function useAdminTabs(params?: ListAdminTabsParams) {
  return useQuery({
    queryKey: [...ADMIN_TABS_KEY, params],
    queryFn: () => listAdminTabs(params),
  });
}

export function useCreateTab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TABS_KEY });
    },
  });
}

export function useUpdateTab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTabInput }) => updateTab(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TABS_KEY });
    },
  });
}

export function useDeleteTab() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TABS_KEY });
    },
  });
}
