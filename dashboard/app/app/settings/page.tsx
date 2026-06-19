'use client';

import { useEffect, useState } from 'react';
import { useT } from '../../i18n/client';

type Project = { id: string; name: string; privacy_mode: string; domain?: string | null; is_active?: boolean };

export default function SettingsPage() {
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [privacyMode, setPrivacyMode] = useState<'standard' | 'high' | 'maximum'>('high');
  const [domain, setDomain] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/dashboard/projects');
        const list = await res.json();
        if (Array.isArray(list)) {
          setProjects(list);
          if (list.length) {
            setProjectId(list[0].id);
            setName(list[0].name);
            setPrivacyMode(list[0].privacy_mode as any);
            setDomain(list[0].domain || '');
            setIsActive(list[0].is_active ?? true);
          }
        } else {
          setProjects([]);
        }
      } catch (e) {
        setProjects([]);
      }
    })();
  }, []);

  async function save() {
    setStatus(null);
    const res = await fetch(`/api/dashboard/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, privacy_mode: privacyMode, domain, is_active: isActive })
    });
    if (!res.ok) {
      setStatus(`Save failed (${res.status})`);
      return;
    }
    setStatus(t('commonSaved'));

    // Refresh projects list so other screens show latest values
    const r2 = await fetch('/api/dashboard/projects');
    if (r2.ok) {
      const list = (await r2.json()) as Project[];
      setProjects(list);
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h1 className="text-[18px] font-medium text-text-primary mb-0.5 tracking-tight">{t('settingsTitle')}</h1>
          <p className="text-[13px] text-text-secondary">{t('settingsSubtitle')}</p>
        </div>
        <select
          className="input text-[13px] py-1.5 px-2 w-48 shrink-0"
          value={projectId}
          onChange={(e) => {
            const id = e.target.value;
            setProjectId(id);
            const p = projects.find((x) => x.id === id);
            if (p) {
              setName(p.name);
              setPrivacyMode(p.privacy_mode as any);
              setDomain(p.domain || '');
              setIsActive(p.is_active ?? true);
            }
          }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          {projects.length === 0 && <option value="">No projects available</option>}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="card flex flex-col gap-3">
          <div>
            <h3 className="m-0 mb-1">{t('settingsName')}</h3>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Marketing site" />
          </div>

          <div>
            <h3 className="m-0 mb-1">{t('settingsPrivacyMode')}</h3>
            <div className="text-[11px] text-text-tertiary mb-2">Controls differential privacy + sampling defaults (Germany-first recommended: high).</div>
            <select className="input" value={privacyMode} onChange={(e) => setPrivacyMode(e.target.value as any)}>
              <option value="standard">standard</option>
              <option value="high">high</option>
              <option value="maximum">maximum</option>
            </select>
          </div>

          <div>
            <h3 className="m-0 mb-1">{t('settingsDomain')}</h3>
            <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.de" />
          </div>

          <div>
            <h3 className="m-0 mb-1">{t('settingsActive')}</h3>
            <label className="text-[13px] flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Enabled
            </label>
          </div>
          
          <div className="mt-2 flex items-center gap-3">
            <button className="btn" onClick={save}>
              {t('commonSave')}
            </button>
            {status ? <div className="text-[11px] text-brand">{status}</div> : null}
          </div>
        </div>

        <div className="card">
          <h3 className="m-0 mb-2">Germany compliance</h3>
          <div className="text-[12px] text-text-secondary leading-relaxed">
            <ul className="list-disc pl-4 space-y-1">
              <li>No cookies required</li>
              <li>No raw event storage</li>
              <li>Opt-out supported</li>
              <li>Data minimization by design</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
