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
      const res = await fetch('/api/dashboard/projects');
      const list = (await res.json()) as Project[];
      setProjects(list);
      if (list.length) {
        setProjectId(list[0].id);
        setName(list[0].name);
        setPrivacyMode(list[0].privacy_mode as any);
        setDomain(list[0].domain || '');
        setIsActive(list[0].is_active ?? true);
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
      <div className="topbar">
        <div>
          <div className="h1">{t('settingsTitle')}</div>
          <div className="sub">{t('settingsSubtitle')}</div>
        </div>
        <select
          className="input"
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
          style={{ width: 280 }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3>{t('settingsName')}</h3>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Marketing site" />

          <h3 style={{ marginTop: 12 }}>{t('settingsPrivacyMode')}</h3>
          <div className="sub">Controls differential privacy + sampling defaults (Germany-first recommended: high).</div>

          <h3 style={{ marginTop: 12 }}>{t('settingsDomain')}</h3>
          <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.de" />

          <h3 style={{ marginTop: 12 }}>{t('settingsActive')}</h3>
          <label className="sub" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Enabled
          </label>
          <select className="input" value={privacyMode} onChange={(e) => setPrivacyMode(e.target.value as any)} style={{ marginTop: 10 }}>
            <option value="standard">standard</option>
            <option value="high">high</option>
            <option value="maximum">maximum</option>
          </select>
          <button className="btn" style={{ marginTop: 10 }} onClick={save}>
            {t('commonSave')}
          </button>
          {status ? <div className="kpiSmall" style={{ marginTop: 10 }}>{status}</div> : null}
        </div>

        <div className="card" style={{ gridColumn: 'span 6' }}>
          <h3>Germany compliance</h3>
          <div className="sub" style={{ lineHeight: 1.6 }}>
            <ul>
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
