import { NextResponse } from 'next/server';
import { apiBaseUrl } from '../../../lib/api';
import { cookies } from 'next/headers';

export async function GET() {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const res = await fetch(`${apiBaseUrl()}/dashboard/projects`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type': 'application/json' } });
}
