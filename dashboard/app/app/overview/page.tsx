'use client';

import { useEffect, useMemo, useState } from 'react';
import { useT } from '../../i18n/client';
import { StatusBadge } from '../../components/StatusBadge';
import { TimelineStacked, type TimelinePoint } from '../../components/TimelineStacked';

type Project = { id: string; name: string; domain?: string | null; privacy_mode: string };

type SeriesPoint = { hour: string; metric_type: string; count: number };

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

type Overview = {
  friction_score: number;
  rage_count: number;
  hesitation_count: number;
  confusion_count: number;
  dead_end_count: number;
  series: SeriesPoint[];
};

export default function OverviewPage() {
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [timeRange, setTimeRange] = useState('24h');
  const [data, setData] = useState<Overview | null>(null);
  const [topReco, setTopReco] = useState<Recommendation | null>(null);
  const [recos, setRecos] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/dashboard/projects');
      if (!res.ok) {
        setError('Failed to load projects');
        return;
      }
      const list = (await res.json()) as Project[];
      setProjects(list);
      if (!projectId && list.length) setProjectId(list[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      setError(null);

      const [overviewRes, topRes, listRes] = await Promise.all([
        fetch(
          `/api/dashboard/analytics/overview?project_id=${encodeURIComponent(projectId)}&time_range=${encodeURIComponent(timeRange)}`
        ),
        fetch(`/api/dashboard/recommendations/top?project_id=${encodeURIComponent(projectId)}`),
        fetch(`/api/dashboard/recommendations?project_id=${encodeURIComponent(projectId)}`)
      ]);

      if (overviewRes.ok) setData((await overviewRes.json()) as Overview);

      if (topRes.ok) setTopReco((await topRes.json()) as Recommendation);
      else setTopReco(null);

      if (listRes.ok) setRecos(((await listRes.json()) as Recommendation[]).filter((r) => r.status === 'open'));
      else setRecos([]);

      if (!overviewRes.ok) {
        const txt = await overviewRes.text();
        setError(`Failed to load analytics (${overviewRes.status}): ${txt}`);
      }
    })();
  }, [projectId, timeRange]);

  const timeline = useMemo<TimelinePoint[]>(() => {
    const series = data?.series ?? [];
    // Build per-hour buckets
    const byHour: Record<string, TimelinePoint> = {};
    for (const p of series) {
      const hour = p.hour.slice(11, 16);
      if (!byHour[hour]) byHour[hour] = { hour, rage: 0, hesitation: 0, confusion: 0, dead_end: 0 };
      if (p.metric_type === 'rage') byHour[hour].rage += p.count;
      if (p.metric_type === 'hesitation') byHour[hour].hesitation += p.count;
      if (p.metric_type === 'confusion') byHour[hour].confusion += p.count;
      if (p.metric_type === 'dead_end') byHour[hour].dead_end += p.count;
    }
    return Object.values(byHour);
  }, [data]);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="h1">{t('overviewTitle')}</div>
          <div className="sub">{t('overviewSubtitle')}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ width: 260 }}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select className="input" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={{ width: 120 }}>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="card" style={{ marginTop: 16, borderColor: 'rgba(255,77,109,0.35)' }}>
          <h3>Error</h3>
          <div style={{ color: 'var(--danger)' }}>{error}</div>
        </div>
      ) : null}

      <div className="grid">
        {/* HERO: #1 problem right now */}
        <div className="card" style={{ gridColumn: 'span 12', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, letterSpacing: 0.4 }}>
                🎯 {t('titleTopProblem')}
              </div>
              <div style={{ marginTop: 10, fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>
                {topReco ? topReco.title : 'No critical issues detected yet'}
              </div>
              {topReco ? (
                <div className="sub" style={{ marginTop: 10, lineHeight: 1.6 }}>
                  <div><b>{t('labelWhat')}:</b> {topReco.what_text}</div>
                  <div><b>{t('labelWhy')}:</b> {topReco.why_text}</div>
                  <div><b>{t('labelWho')}:</b> {topReco.who_text}</div>
                  <div><b>{t('labelCost')}:</b> €{Math.round(topReco.impact_month_eur).toLocaleString()}/Monat</div>
                  <div><b>{t('labelFix')}:</b> {topReco.effort_minutes} min — {topReco.fix_summary}</div>
                </div>
              ) : null}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              {topReco ? <StatusBadge level={topReco.priority} /> : null}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <a className="btn" href="/app/recommendations">{t('btnFixNow')}</a>
                <button
                  className="btn btnSecondary"
                  onClick={() => {
                    if (topReco) navigator.clipboard.writeText(topReco.fix_code);
                  }}
                >
                  {t('btnCopyCode')}
                </button>
                <a className="btn btnSecondary" href="/app/recommendations">{t('btnTechnicalDetails')}</a>
              </div>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <h3>🎯 UX Health Score</h3>
          <div className="kpi">{data?.friction_score ?? '—'}/100</div>
          <div className="kpiSmall">AI target: 85 (fix top 3 issues)</div>
        </div>

        <div className="card" style={{ gridColumn: 'span 4' }}>
          <h3>💰 {t('titleFrictionCost')}</h3>
          <div className="kpi">€{topReco ? Math.round(topReco.cost_week_eur).toLocaleString() : '—'}/week</div>
          <div className="kpiSmall">Lost to friction (demo estimate)</div>
        </div>

        <div className="card" style={{ gridColumn: 'span 4' }}>
          <h3>🔒 {t('titlePrivacyStatus')}</h3>
          <div className="kpi" style={{ fontSize: 20 }}>100% Compliant</div>
          <div className="kpiSmall">✅ No cookies • ✅ No PII • 🇩🇪 Data in Germany</div>
        </div>

        {/* AI Recommendations */}
        <div className="card" style={{ gridColumn: 'span 7' }}>
          <h3>🤖 {t('titleAiRecommendations')} (Priorisiert)</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {recos.slice(0, 3).map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <StatusBadge level={r.priority} />
                    <div style={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                  </div>
                  <div className="kpiSmall" style={{ marginTop: 8, lineHeight: 1.5 }}>
                    €{Math.round(r.impact_month_eur).toLocaleString()}/month • {r.effort_minutes} min • {Math.round(r.confidence * 100)}% confidence
                  </div>
                </div>
                <a className="btn btnSecondary" href="/app/recommendations">{t('btnOpen')}</a>
              </div>
            ))}
            {!recos.length ? <div className="sub">No recommendations available yet.</div> : null}
          </div>
          <div style={{ marginTop: 12 }}>
            <a className="btn btnSecondary" href="/app/recommendations">{t('btnShowAll')}</a>
          </div>
        </div>

        {/* Timeline */}
        <div className="card" style={{ gridColumn: 'span 5' }}>
          <h3>📅 {t('titleFrictionTimeline')}</h3>
          <TimelineStacked points={timeline} />
          <div className="kpiSmall">Stacked hourly incidents (rage/hesitation/confusion/dead-end)</div>
        </div>
      </div>
    </>
  );
}
