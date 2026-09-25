import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Difficulty, Instrument, TabStatus, TabType } from '@/lib/api/enums';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { sendBulkImport } from './import.api';
import type { BulkImportRequestDto, BulkImportResponseDto } from './import.types';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('sendBulkImport', () => {
  const mockDto: BulkImportRequestDto = {
    artist: { name: 'Test Artist' },
    defaults: {
      status: TabStatus.DRAFT,
      difficulty: Difficulty.INTERMEDIATE,
      instrument: Instrument.GUITAR,
    },
    songs: [
      {
        title: 'Test Song',
        versions: [{ content: '{title: Test}\n{artist: Test}', tabType: TabType.CHORDS }],
      },
    ],
  };

  const mockResponse: BulkImportResponseDto = {
    inserted: { artists: 1, songs: 1, tabs: 1 },
    skipped: 0,
    results: [
      {
        title: 'Test Song',
        songStatus: 'created',
        songId: 'uuid',
        tabsInserted: 1,
        tabsSkipped: 0,
      },
    ],
    errors: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls apiClient.post with correct endpoint and DTO', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
    await sendBulkImport(mockDto);
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/admin/tabs/bulk-import', mockDto);
  });

  it('returns response on success', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
    const result = await sendBulkImport(mockDto);
    expect(result).toEqual(mockResponse);
  });

  it('propagates ApiError on 413 (does NOT retry internally)', async () => {
    const error = new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Payload too large');
    vi.mocked(apiClient.post).mockRejectedValue(error);
    await expect(sendBulkImport(mockDto)).rejects.toThrow(error);
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });

  it('propagates ApiError on 422', async () => {
    const error = new ApiError(422, 'VALIDATION_ERROR', 'Invalid data', [
      { field: 'songs[0].title', message: 'Required' },
    ]);
    vi.mocked(apiClient.post).mockRejectedValue(error);
    await expect(sendBulkImport(mockDto)).rejects.toThrow(error);
  });

  it('propagates ApiError on 401', async () => {
    const error = new ApiError(401, 'UNAUTHORIZED', 'Not authenticated');
    vi.mocked(apiClient.post).mockRejectedValue(error);
    await expect(sendBulkImport(mockDto)).rejects.toThrow(error);
  });

  it('propagates ApiError on 403', async () => {
    const error = new ApiError(403, 'FORBIDDEN', 'Not authorized');
    vi.mocked(apiClient.post).mockRejectedValue(error);
    await expect(sendBulkImport(mockDto)).rejects.toThrow(error);
  });

  it('propagates network error (no response)', async () => {
    const error = new Error('Network error');
    vi.mocked(apiClient.post).mockRejectedValue(error);
    await expect(sendBulkImport(mockDto)).rejects.toThrow(error);
  });
});
