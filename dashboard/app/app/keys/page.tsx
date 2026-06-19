'use client';

import { useEffect, useState } from 'react';
import { useT } from '../../i18n/client';

type Project = { id: string; name: string };

type Key = {
  id: string;
  key_prefix: string;
  name?: string | null;
  created_at: string;
  last_used_at?: string | null;
};

type CreateResp = { api_key: string; key: Key };

export default function KeysPage() {
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [keys, setKeys] = useState<Key[]>([]);
  const [newKeyName, setNewKeyName] = useState('Production');
  const [created, setCreated] = useState<string | null>(null);

  async function loadProjects() {
    const res = await fetch('/api/dashboard/projects');
    const list = (await res.json()) as Project[];
    setProjects(list);
    if (!projectId && list.length) setProjectId(list[0].id);
  }

  async function loadKeys(pid: string) {
    const res = await fetch(`/api/dashboard/projects/${pid}/keys`);
    const list = (await res.json()) as Key[];
    setKeys(list);
  }

  useEffect(() => {
    void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!projectId) return;
    void loadKeys(projectId);
  }, [projectId]);

  async function createKey() {
    setCreated(null);
    const res = await fetch(`/api/dashboard/projects/${projectId}/keys`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: newKeyName })
    });
    const data = (await res.json()) as CreateResp;
    setCreated(data.api_key);
    await loadKeys(projectId);
  }

  async function revoke(keyId: string) {
    await fetch(`/api/dashboard/projects/${projectId}/keys/${keyId}/revoke`, { method: 'POST' });
    await loadKeys(projectId);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="h1">{t('keysTitle')}</div>
          <div className="sub">{t('keysSubtitle')}</div>
        </div>
        <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ width: 280 }}>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3>{t('keysCreateNew')}</h3>
          <input className="input" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
          <button className="btn" style={{ marginTop: 10 }} onClick={createKey}>
            {t('keysCreateBtn')}
          </button>
          {created ? (
            <>
              <hr className="hr" />
              <h3>{t('keysNewKeyCopy')}</h3>
              <pre className="code">{created}</pre>
            </>
          ) : null}
        </div>

        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3>{t('keysActive')}</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {keys.map((k) => (
              <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{k.name || 'Key'}</div>
                  <div className="kpiSmall">
                    {k.key_prefix} • created {new Date(k.created_at).toLocaleString()}
                  </div>
                </div>
                <button className="btn btnSecondary" onClick={() => revoke(k.id)}>
                  {t('keysRevoke')}
                </button>
              </div>
            ))}
            {!keys.length ? <div className="sub">{t('keysNoKeys')}</div> : null}
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 12' }}>
          <h3>SDK snippet</h3>
          <pre className="code">{`import ZeroBanner from '@zerobanner/analytics';

const analytics = new ZeroBanner({
  apiKey: 'YOUR_API_KEY',
  apiBaseUrl: '${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}',
  privacyLevel: 'high'
});

await analytics.init();
`}</pre>
        </div>
      </div>
    </>
  );
}
