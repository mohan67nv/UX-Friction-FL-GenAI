import { cookies } from 'next/headers';
import { Locale, translations } from './translations';

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get('pe_lang')?.value;
  // Default to German for Germany-first product; allow English via switch cookie.
  return v === 'en' ? 'en' : 'de';
}

/**
 * Convenience helper to get a locale-bound translator function.
 * Use this in Server Components and Route Handlers.
 */
export async function getT(): Promise<(key: string) => string> {
  const loc = await getLocale();
  return (key: string) => translations[loc][key] ?? key;
}
