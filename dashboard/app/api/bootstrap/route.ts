import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name } = (await request.json().catch(() => ({}))) as { name?: string };

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_TOKEN || '';

  if (!adminToken) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_ADMIN_BOOTSTRAP_TOKEN (used only to create the first project)' },
      { status: 400 }
    );
  }

  const url = new URL(`${baseUrl}/api/v1/admin/bootstrap`);
  url.searchParams.set('name', name || 'Germany MVP Project');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'x-admin-token': adminToken },
    cache: 'no-store'
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type': 'application/json' } });
}
