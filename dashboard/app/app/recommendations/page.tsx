'use client';

import { useEffect, useMemo, useState } from 'react';
import { useT } from '../../i18n/client';
import { StatusBadge } from '../../components/StatusBadge';

type Project = { id: string; name: string };

type Recommendation = {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'done' | 'dismissed';
  title: string;
  what_text: string;
  why_text: string;
  who_text: string;
  confidence: number;
  incidents_week: number;
  cost_week_eur: number;
  impact_month_eur: number;
  fix_summary: string;
  fix_code: string;
  effort_minutes: number;
};

export default function RecommendationsPage() {
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [items, setItems] = useState<Recommendation[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/dashboard/projects');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const list = (await res.json()) as Project[];
      if (!Array.isArray(list)) return;
      setProjects(list);
      if (!projectId && list.length) setProjectId(list[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const res = await fetch(`/api/dashboard/recommendations?project_id=${encodeURIComponent(projectId)}`);
      if (!res.ok) {
        setItems([]);
        return;
      }
      const list = (await res.json()) as Recommendation[];
      if (!Array.isArray(list)) {
        setItems([]);
        return;
      }
      setItems(list);
      setExpanded(list.find((x) => x.status === 'open')?.id ?? null);
    })();
  }, [projectId]);

  const openItems = useMemo(() => items.filter((x) => x.status === 'open'), [items]);

  async function markDone(id: string) {
    await fetch(`/api/dashboard/recommendations/${id}/done`, { method: 'POST' });
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'done' } : p)));
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="h1">🤖 {t('navRecommendations')}</div>
          <div className="sub">Priorisiert nach erwartetem Impact (Demo).</div>
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
        <div className="card" style={{ gridColumn: 'span 12' }}>
          <h3>{t('navRecommendations')}</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {openItems.map((r) => (
              <div key={r.id} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <StatusBadge level={r.priority} />
                      <div style={{ fontWeight: 900 }}>{r.title}</div>
                      <div className="badge">€{Math.round(r.impact_month_eur).toLocaleString()}/mo</div>
                      <div className="badge">{Math.round(r.confidence * 100)}% conf</div>
                    </div>
                    <div className="sub" style={{ marginTop: 10, lineHeight: 1.6 }}>
                      <div><b>{t('labelWhat')}:</b> {r.what_text}</div>
                      <div><b>{t('labelWhy')}:</b> {r.why_text}</div>
                      <div><b>{t('labelWho')}:</b> {r.who_text}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button className="btn btnSecondary" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                      {expanded === r.id ? t('btnHide') : t('btnDetails')}
                    </button>
                    <button
                      className="btn"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(r.fix_code);
                        } catch {
                          // Fallback for insecure contexts/permissions
                          window.prompt('Copy code:', r.fix_code);
                        }
                      }}
                    >
                      {t('btnCopyCode')}
                    </button>
                    <button className="btn btnSecondary" onClick={() => markDone(r.id)}>
                      {t('btnMarkDone')}
                    </button>
                  </div>
                </div>

                {expanded === r.id ? (
                  <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                    <div className="card" style={{ background: 'rgba(0,0,0,0.20)' }}>
                      <h3>{t('btnTechnicalDetails')}</h3>
                      <div className="sub">{r.fix_summary}</div>
                      <pre className="code" style={{ marginTop: 10 }}>{r.fix_code}</pre>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            {!openItems.length ? <div className="sub">—</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
