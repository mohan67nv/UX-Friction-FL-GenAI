'use client';

import { useState } from 'react';

import { useT } from '../i18n/client';

export default function SignupPage() {
  const t = useT();
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, name, organization_name: org })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.detail || `Signup failed (${res.status})`);
        return;
      }
      window.location.href = '/app';
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: '60px auto', padding: 16 }}>
      <h1 style={{ margin: 0 }}>{t('authCreateAccount')}</h1>
      <p style={{ color: 'var(--muted)' }}>Start with an organization for your German/EU properties.</p>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>{t('authName')}</h3>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <h3 style={{ marginTop: 12 }}>{t('authOrganization')}</h3>
        <input className="input" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Acme GmbH" />
        <h3 style={{ marginTop: 12 }}>{t('authEmail')}</h3>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <h3 style={{ marginTop: 12 }}>{t('authPassword')}</h3>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <div style={{ color: 'var(--danger)', marginTop: 10 }}>{error}</div> : null}
        <button className="btn" style={{ marginTop: 12, width: '100%' }} onClick={submit} disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <div className="kpiSmall" style={{ marginTop: 12 }}>
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </main>
  );
}
