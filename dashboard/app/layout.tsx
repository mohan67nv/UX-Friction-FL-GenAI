import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'PrivacyEdge Dashboard',
  description: 'Privacy-first UX analytics dashboard (Germany-first)'
};

import { getLocale } from './i18n/server';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
