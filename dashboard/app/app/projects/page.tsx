'use client';

import { useEffect, useState } from 'react';
import { useT } from '../../i18n/client';

type Project = { id: string; name: string; domain?: string | null; privacy_mode: string; created_at: string };

type Org = { id: string; name: string };

export default function ProjectsPage() {
  const t = useT();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [orgId, setOrgId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState('Website');
  const [domain, setDomain] = useState('');
  const [privacyMode, setPrivacyMode] = useState<'high' | 'standard' | 'maximum'>('high');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const o = await fetch('/api/dashboard/orgs');
      const orgList = (await o.json()) as Org[];
      setOrgs(orgList);
      if (!orgId && orgList.length) setOrgId(orgList[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/dashboard/projects');
      const list = (await res.json()) as Project[];
      setProjects(list);
    })();
  }, [createdKey]);

  async function createProject() {
    setCreatedKey(null);
    const res = await fetch('/api/dashboard/projects/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ organization_id: orgId, name, domain, privacy_mode: privacyMode })
    });
    const json = await res.json();
    if (res.ok) {
      setCreatedKey(json.api_key);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="h1">{t('projectsTitle')}</div>
          <div className="sub">{t('projectsSubtitle')}</div>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3>{t('projectsCreate')}</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            <select className="input" value={orgId} onChange={(e) => setOrgId(e.target.value)}>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Marketing site" />
            <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.de" />
            <select className="input" value={privacyMode} onChange={(e) => setPrivacyMode(e.target.value as any)}>
              <option value="standard">standard</option>
              <option value="high">high</option>
              <option value="maximum">maximum</option>
            </select>
            <button className="btn" onClick={createProject}>
              {t('commonCreate')}
            </button>
          </div>
          {createdKey ? (
            <>
              <hr className="hr" />
              <h3>API key (copy now)</h3>
              <pre className="code">{createdKey}</pre>
            </>
          ) : null}
        </div>

        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3>{t('projectsYour')}</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {projects.map((p) => (
              <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 800 }}>{p.name}</div>
                <div className="kpiSmall">{p.domain || '—'} • privacy: {p.privacy_mode}</div>
              </div>
            ))}
            {!projects.length ? <div className="sub">{t('projectsNoProjects')}</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
