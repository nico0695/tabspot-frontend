import 'server-only';

import { cache } from 'react';
import { env } from '@/lib/env';
import { ApiError } from './types';
import type { SongDetail, ArtistDetail } from '@/features/catalog/catalog.types';
import type { TabDetail } from '@/features/tabs/tabs.types';

const API_BASE = env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Server-side fetch helper for public API endpoints.
 * Returns `null` on 404 so RSC pages can call `notFound()`.
 * Throws `ApiError` on other error responses.
 */
async function serverFetch<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`);

  if (res.status === 404) return null;

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? res.statusText,
      body.error?.fields,
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

export const fetchSongBySlug = cache(
  (slug: string): Promise<SongDetail | null> => serverFetch<SongDetail>(`/api/v1/songs/${slug}`),
);

export const fetchArtistBySlug = cache(
  (slug: string): Promise<ArtistDetail | null> =>
    serverFetch<ArtistDetail>(`/api/v1/artists/${slug}`),
);

export const fetchTabById = cache(
  (id: string): Promise<TabDetail | null> => serverFetch<TabDetail>(`/api/v1/tabs/${id}`),
);
