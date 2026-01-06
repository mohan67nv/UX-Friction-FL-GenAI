import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('time_range') ?? '24h';

  const baseUrl = process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'x'.repeat(20);

  const res = await fetch(`${baseUrl}/api/v1/dashboard/friction?time_range=${encodeURIComponent(timeRange)}`, {
    headers: { 'x-api-key': apiKey },
    cache: 'no-store'
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'content-type': 'application/json' } });
}
