import { NextResponse } from 'next/server';
import { apiBaseUrl } from '../../../lib/api';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  if (!projectId) return NextResponse.json({ error: 'missing project_id' }, { status: 400 });

  const res = await fetch(`${apiBaseUrl()}/dashboard/benchmarks?project_id=${encodeURIComponent(projectId)}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type': 'application/json' } });
}
