'use client';

import { useState } from 'react';

import { useT } from '../i18n/client';

export default function LoginPage() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.detail || `Login failed (${res.status})`);
        return;
      }
      window.location.href = '/app';
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 16 }}>
      <h1 style={{ margin: 0 }}>{t('authSignIn')}</h1>
      <p style={{ color: 'var(--muted)' }}>Germany-first privacy analytics dashboard.</p>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>{t('authEmail')}</h3>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <h3 style={{ marginTop: 12 }}>{t('authPassword')}</h3>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <div style={{ color: 'var(--danger)', marginTop: 10 }}>{error}</div> : null}
        <button className="btn" style={{ marginTop: 12, width: '100%' }} onClick={submit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="kpiSmall" style={{ marginTop: 12 }}>
          No account? <a href="/signup">Create one</a>
        </div>
      </div>
    </main>
  );
}
