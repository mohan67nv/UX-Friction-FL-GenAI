import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store'
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(json, { status: res.status });
  }

  const token = json.access_token as string;
  const out = NextResponse.json({ user: json.user }, { status: 200 });
  out.cookies.set('pe_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/'
  });
  return out;
}
