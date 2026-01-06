import { cookies } from 'next/headers';

import { internalApiBaseUrl } from './apiBase';

export function apiBaseUrl(): string {
  // Used by Next.js route handlers and server components.
  return internalApiBaseUrl();
}

export async function getAuthToken(): Promise<string | null> {
  return (await cookies()).get('pe_token')?.value ?? null;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getAuthToken();
  const headers = new Headers(init.headers);

  if (token) headers.set('authorization', `Bearer ${token}`);
  headers.set('content-type', headers.get('content-type') || 'application/json');

  const res = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  });

  return res;
}
