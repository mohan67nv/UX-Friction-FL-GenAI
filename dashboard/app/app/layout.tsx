'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import Sidebar from '../components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated (Disabled for UI review)
    // if (!loading && !user) {
    //   router.push('/login');
    // }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#0E1117'
      }}>
        <div style={{ color: '#8B949E', fontSize: 18 }}>Loading...</div>
      </div>
    );
  }

  // Show login redirect if not authenticated
  // if (!user) {
  //   return null; // Redirect happens in useEffect
  // }

  return <Sidebar>{children}</Sidebar>;
}
