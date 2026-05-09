import { env } from '@/lib/env';
import { parseApiError } from '@/lib/api/errors';

export async function fetchWithAuth<T>(token: string, path: string): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw parseApiError(response.status, body);
  }

  return response.json() as Promise<T>;
}
