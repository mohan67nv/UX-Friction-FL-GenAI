import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function apiBaseUrl(): string {
  return process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
}

export async function GET(request: Request) {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const limit = searchParams.get('limit') ?? '50';
  if (!projectId) return NextResponse.json({ detail: 'missing project_id' }, { status: 400 });

  const res = await fetch(
    `${apiBaseUrl()}/dashboard/ux-auditor/history?project_id=${encodeURIComponent(projectId)}&limit=${encodeURIComponent(limit)}`,
    {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store'
    }
  );

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') || 'application/json' }
  });
}
