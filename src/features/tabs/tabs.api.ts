import { apiClient } from '@/lib/api/client';
import type { TabDetail } from './tabs.types';

export function getTabById(id: string): Promise<TabDetail> {
  return apiClient.get<TabDetail>(`/api/v1/tabs/${id}`);
}
