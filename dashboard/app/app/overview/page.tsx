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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
        <div>
          <h1 className="text-[18px] font-medium text-text-primary mb-0.5 tracking-tight">{t('overviewTitle')}</h1>
          <p className="text-[13px] text-text-secondary">{t('overviewSubtitle')}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="input text-[13px] py-1.5 px-2 flex-1 md:w-48" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            {projects.length === 0 && <option value="">No projects available</option>}
          </select>
          <select className="input text-[13px] py-1.5 px-2 w-24 shrink-0" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2.5 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="text-[12px] text-red-400 font-medium truncate">{error}</div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 mt-4">
        {/* HERO BANNER: #1 problem right now */}
        <div className="bg-brand/10 border border-brand/20 rounded-md p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-[11px] text-brand font-semibold uppercase tracking-wider mb-1">
              🎯 {t('titleTopProblem')}
            </div>
            <div className="text-sm font-bold text-text-primary">
              {topReco ? topReco.title : 'No critical issues detected yet'}
            </div>
            {topReco ? (
              <div className="text-[13px] text-text-secondary mt-1">
                {topReco.what_text} • Fix takes ~{topReco.effort_minutes} mins
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {topReco ? <StatusBadge level={topReco.priority} /> : null}
            <a className="btn" href="/app/recommendations">{t('btnFixNow')}</a>
          </div>
        </div>

        {/* KPI cards (3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="text-[13px] font-semibold text-text-secondary mb-1 m-0">🎯 UX Health Score</h3>
            <div className="text-2xl font-bold text-text-primary">{data?.friction_score ?? '—'}/100</div>
            <div className="text-[11px] text-text-tertiary mt-1">AI target: 85 (fix top 3 issues)</div>
          </div>

          <div className="card">
            <h3 className="text-[13px] font-semibold text-text-secondary mb-1 m-0">💰 {t('titleFrictionCost')}</h3>
            <div className="text-2xl font-bold text-text-primary">€{topReco ? Math.round(topReco.cost_week_eur).toLocaleString() : '—'}/week</div>
            <div className="text-[11px] text-text-tertiary mt-1">Lost to friction (demo estimate)</div>
          </div>

          <div className="card">
            <h3 className="text-[13px] font-semibold text-text-secondary mb-1 m-0">🔒 {t('titlePrivacyStatus')}</h3>
            <div className="text-2xl font-bold text-success">100% Compliant</div>
            <div className="text-[11px] text-text-tertiary mt-1">✅ No cookies • ✅ No PII • 🇩🇪 Data in Germany</div>
          </div>
        </div>

        {/* Split View: Recommendations & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* AI Recommendations */}
          <div className="card flex flex-col min-w-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[13px] font-semibold text-text-secondary m-0">🤖 {t('titleAiRecommendations')}</h3>
              <a className="text-[11px] font-medium text-brand hover:text-brand-hover transition-colors" href="/app/recommendations">{t('btnShowAll')} &rarr;</a>
            </div>
            
            <div className="flex flex-col gap-2 flex-1">
              {recos.slice(0, 3).map((r) => (
                <div key={r.id} className="flex justify-between items-center gap-3 bg-background border border-border rounded-md p-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge level={r.priority} />
                      <div className="font-semibold text-text-primary text-[13px] truncate">{r.title}</div>
                    </div>
                    <div className="text-[11px] text-text-tertiary">
                      €{Math.round(r.impact_month_eur).toLocaleString()}/mo • {r.effort_minutes} min
                    </div>
                  </div>
                  <a className="btn btnSecondary text-[11px] px-2 py-1 whitespace-nowrap" href="/app/recommendations">{t('btnOpen')}</a>
                </div>
              ))}
              {!recos.length ? <div className="text-[13px] text-text-tertiary">No recommendations available yet.</div> : null}
            </div>
          </div>

          {/* Timeline */}
          <div className="card flex flex-col min-w-0">
            <h3 className="text-[13px] font-semibold text-text-secondary mb-1 m-0">📅 {t('titleFrictionTimeline')}</h3>
            <div className="text-[11px] text-text-tertiary mb-4">Stacked hourly incidents</div>
            <div className="flex-1 min-h-[220px] -ml-4">
              <TimelineStacked points={timeline} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
