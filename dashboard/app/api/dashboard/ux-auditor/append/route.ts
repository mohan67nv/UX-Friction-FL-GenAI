import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function apiBaseUrl(): string {
  return process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
}

export async function POST(req: Request) {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const res = await fetch(`${apiBaseUrl()}/dashboard/ux-auditor/append`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') || 'application/json' }
  });
}
