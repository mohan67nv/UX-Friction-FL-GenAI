import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AppIndex() {
  const token = (await cookies()).get('pe_token')?.value;
  if (!token) redirect('/login');
  redirect('/app/overview');
}
