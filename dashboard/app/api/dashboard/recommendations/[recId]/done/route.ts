import { NextResponse } from 'next/server';
import { apiBaseUrl } from '../../../../../lib/api';
import { cookies } from 'next/headers';

export async function POST(_request: Request, ctx: { params: Promise<{ recId: string }> }) {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { recId } = await ctx.params;

  const res = await fetch(`${apiBaseUrl()}/api/dashboard/recommendations/${recId}/done`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type': 'application/json' } });
}
