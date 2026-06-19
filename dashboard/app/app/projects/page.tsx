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
      try {
        const o = await fetch('/api/dashboard/orgs');
        const orgList = await o.json();
        if (Array.isArray(orgList)) {
          setOrgs(orgList);
          if (!orgId && orgList.length) setOrgId(orgList[0].id);
        } else {
          setOrgs([]);
        }
      } catch (err) {
        setOrgs([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/dashboard/projects');
        const list = await res.json();
        if (Array.isArray(list)) {
          setProjects(list);
        } else {
          setProjects([]);
        }
      } catch (err) {
        setProjects([]);
      }
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
      <div className="flex flex-col mb-5">
        <h1 className="text-[18px] font-medium text-text-primary mb-0.5 tracking-tight">{t('projectsTitle')}</h1>
        <p className="text-[13px] text-text-secondary">{t('projectsSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="card flex flex-col gap-3">
          <h3 className="m-0">{t('projectsCreate')}</h3>
          <div className="flex flex-col gap-2.5">
            <select className="input text-[13px]" value={orgId} onChange={(e) => setOrgId(e.target.value)}>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
              {orgs.length === 0 && <option value="">No organizations available</option>}
            </select>
            <input className="input text-[13px]" value={name} onChange={(e) => setName(e.target.value)} placeholder="Marketing site" />
            <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.de" />
            <select className="input text-[13px]" value={privacyMode} onChange={(e) => setPrivacyMode(e.target.value as any)}>
              <option value="standard">standard</option>
              <option value="high">high</option>
              <option value="maximum">maximum</option>
            </select>
            <button className="btn mt-2" onClick={createProject}>
              {t('commonCreate')}
            </button>
          </div>
          {createdKey ? (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-[13px] font-medium mb-2">API key (copy now)</h3>
              <pre className="code">{createdKey}</pre>
            </div>
          ) : null}
        </div>

        <div className="card flex flex-col gap-3">
          <h3 className="m-0">{t('projectsYour')}</h3>
          <div className="flex flex-col gap-2.5">
            {projects.map((p) => (
              <div key={p.id} className="bg-background-elevated border border-border rounded-md p-3 flex flex-col">
                <div className="text-[13px] font-semibold text-text-primary mb-0.5">{p.name}</div>
                <div className="text-[11px] text-text-tertiary">{p.domain || '—'} • privacy: {p.privacy_mode}</div>
              </div>
            ))}
            {!projects.length ? <div className="sub">{t('projectsNoProjects')}</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
