'use client';

import { Locale, translations } from './translations';

function getCookie(name: string): string | null {
  // During SSR/pre-render there is no `document`.
  if (typeof document === 'undefined') return null;

  const parts = document.cookie.split(';').map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith(name + '=')) return decodeURIComponent(p.slice(name.length + 1));
  }
  return null;
}

export function getClientLocale(): Locale {
  const v = getCookie('pe_lang');
  // Default to German for Germany-first product
  return v === 'en' ? 'en' : 'de';
}

export function useT() {
  const locale = getClientLocale();
  return (key: string) => translations[locale][key] ?? key;
}
