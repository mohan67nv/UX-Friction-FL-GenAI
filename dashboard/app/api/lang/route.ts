import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  const locale = body.locale === 'de' ? 'de' : 'en';

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set('pe_lang', locale, { httpOnly: false, sameSite: 'lax', path: '/' });
  return res;
}
