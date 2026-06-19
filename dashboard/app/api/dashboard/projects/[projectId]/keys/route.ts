import { NextResponse } from 'next/server';
import { apiBaseUrl } from '../../../../../lib/api';
import { cookies } from 'next/headers';

export async function GET(_request: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { projectId } = await ctx.params;
  const res = await fetch(`${apiBaseUrl()}/api/dashboard/projects/${projectId}/api-keys`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type': 'application/json' } });
}

export async function POST(request: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { projectId } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  const res = await fetch(`${apiBaseUrl()}/api/dashboard/projects/${projectId}/api-keys`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type': 'application/json' } });
}
