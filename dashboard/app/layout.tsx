import './globals.css';
import type { ReactNode } from 'react';
import { AuthProvider } from './lib/auth-context';

export const metadata = {
  title: 'ZeroBanner Dashboard',
  description: 'Privacy-first UX analytics dashboard (Germany-first)'
};

import { getLocale } from './i18n/server';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
