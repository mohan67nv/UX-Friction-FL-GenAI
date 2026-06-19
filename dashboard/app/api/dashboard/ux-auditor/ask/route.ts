import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function apiBaseUrl(): string {
  return process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
}

export async function POST(req: Request) {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) {
    console.error('[ux-auditor/ask] missing pe_token cookie');
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  console.log('[ux-auditor/ask] request', {
    project_id: body?.project_id,
    time_range: body?.time_range,
    lang: body?.lang
  });

  const res = await fetch(`${apiBaseUrl()}/api/dashboard/ux-auditor/ask`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  const text = await res.text();
  console.log('[ux-auditor/ask] response', { status: res.status, bytes: text?.length || 0 });

  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') || 'application/json' }
  });
}
