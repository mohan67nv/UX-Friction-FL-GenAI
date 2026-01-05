import { cookies } from 'next/headers';

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
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
