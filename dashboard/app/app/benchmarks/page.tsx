'use client';

import { useEffect, useState } from 'react';
import { useT } from '../../i18n/client';

type Project = { id: string; name: string };

type Bench = {
  ux_health_score: number;
  industry_score: number;
  rage_rate_per_1k: number;
  industry_rage_rate_per_1k: number;
  hesitation_rate_pct: number;
  industry_hesitation_rate_pct: number;
  cart_abandonment_pct: number;
  industry_cart_abandonment_pct: number;
  notes: string[];
};

export default function BenchmarksPage() {
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [data, setData] = useState<Bench | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/dashboard/projects');
      const list = (await res.json()) as Project[];
      setProjects(list);
      if (!projectId && list.length) setProjectId(list[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const res = await fetch(`/api/dashboard/benchmarks?project_id=${encodeURIComponent(projectId)}`);
      setData((await res.json()) as Bench);
    })();
  }, [projectId]);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="h1">📊 {t('benchmarksTitle')}</div>
          <div className="sub">{t('benchmarksSubtitle')}</div>
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
          <h3>{t('benchmarksCompareTitle')}</h3>
          {!data ? (
            <div className="sub">{t('benchmarksLoading')}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                  <th style={{ padding: '10px 0' }}>{t('benchmarksMetric')}</th>
                  <th style={{ padding: '10px 0' }}>{t('benchmarksYou')}</th>
                  <th style={{ padding: '10px 0' }}>{t('benchmarksIndustry')}</th>
                </tr>
              </thead>
              <tbody>
                <Row label={t('benchmarksUxHealth')} you={`${data.ux_health_score}/100`} industry={`${data.industry_score}/100`} />
                <Row label={t('benchmarksRageRate')} you={data.rage_rate_per_1k.toFixed(1)} industry={data.industry_rage_rate_per_1k.toFixed(1)} />
                <Row label={t('benchmarksHesitationRate')} you={`${data.hesitation_rate_pct.toFixed(1)}%`} industry={`${data.industry_hesitation_rate_pct.toFixed(1)}%`} />
                <Row label={t('benchmarksCartAbandon')} you={`${data.cart_abandonment_pct.toFixed(1)}%`} industry={`${data.industry_cart_abandonment_pct.toFixed(1)}%`} />
              </tbody>
            </table>
          )}

          {data?.notes?.length ? (
            <div className="kpiSmall" style={{ marginTop: 12 }}>
              {data.notes.map((n, i) => (
                <div key={i}>• {n}</div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Row(props: { label: string; you: string; industry: string }) {
  return (
    <tr style={{ borderTop: '1px solid var(--border)' }}>
      <td style={{ padding: '10px 0' }}>{props.label}</td>
      <td style={{ padding: '10px 0', fontWeight: 800 }}>{props.you}</td>
      <td style={{ padding: '10px 0', color: 'var(--muted)' }}>{props.industry}</td>
    </tr>
  );
}
