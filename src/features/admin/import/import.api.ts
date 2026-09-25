import { apiClient } from '@/lib/api/client';
import type { BulkImportRequestDto, BulkImportResponseDto } from './import.types';

const ENDPOINT = '/api/v1/admin/tabs/bulk-import';

export async function sendBulkImport(dto: BulkImportRequestDto): Promise<BulkImportResponseDto> {
  return apiClient.post<BulkImportResponseDto>(ENDPOINT, dto);
}
