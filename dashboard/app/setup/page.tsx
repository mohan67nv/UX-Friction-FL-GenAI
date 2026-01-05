'use client';

import { useState } from 'react';
import { Shell } from '../components/Shell';

export default function SetupPage() {
  const [name, setName] = useState('Germany MVP Project');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function bootstrap() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/bootstrap', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const json = await res.json();
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell active="setup">
      <div className="topbar">
        <div>
          <div className="h1">Setup</div>
          <div className="sub">Create a first project + API key (Germany-first defaults).</div>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 7' }}>
          <h3>Bootstrap project</h3>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn" onClick={bootstrap} disabled={loading}>
              {loading ? 'Creating…' : 'Create project'}
            </button>
            <a className="btn btnSecondary" href="/" style={{ padding: '10px 12px', borderRadius: 10 }}>
              Go to overview
            </a>
          </div>
          <div className="kpiSmall" style={{ marginTop: 12 }}>
            This is legacy MVP setup. Production flow is: Sign up → Create project → Create API key.
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 5' }}>
          <h3>Germany compliance defaults</h3>
          <div className="sub">
            <ul>
              <li>No cookies / localStorage for tracking</li>
              <li>No raw events stored server-side</li>
              <li>Aggregated metrics only</li>
              <li>Designed for Legitimate Interest (GDPR Art. 6(1)(f))</li>
            </ul>
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 12' }}>
          <h3>Result</h3>
          <pre className="code">{result ? JSON.stringify(result, null, 2) : 'No project created yet.'}</pre>
          {result?.api_key ? (
            <>
              <hr className="hr" />
              <h3>Integrate SDK</h3>
              <pre className="code">{`import PrivacyEdge from '@privacyedge/analytics';

const analytics = new PrivacyEdge({
  apiKey: '${result.api_key}',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  privacyLevel: 'high'
});

await analytics.init();
`}</pre>
            </>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}
