import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Shell } from '../components/Shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) redirect('/login');

  return <Shell active="app">{children}</Shell>;
}
