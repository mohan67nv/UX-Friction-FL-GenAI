/**
 * OAuth Callback Handler
 * Handles OAuth redirects from Supabase (Google, GitHub, etc.)
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Exchange code for session
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errDesc = params.get('error_description') || hashParams.get('error_description');
        
        if (errDesc) {
          router.push(`/login?error=${encodeURIComponent(errDesc.replace(/\+/g, ' '))}`);
          return;
        }

        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Exchange code error:', exchangeError);
            router.push(`/login?error=${encodeURIComponent(exchangeError.message)}`);
            return;
          }
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          router.push('/login?error=oauth_failed');
          return;
        }

        if (data.session) {
          console.log('OAuth successful:', data.session.user.email);
          router.push('/app');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Unexpected error in OAuth callback:', error);
        router.push('/login?error=unexpected');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ fontSize: '18px', color: '#666' }}>Signing you in...</p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
