'use client';

import Link from 'next/link';
import { LanguageSwitch } from './LanguageSwitch';
import { getClientLocale, useT } from '../i18n/client';

export function Shell(props: { active: 'overview' | 'setup' | 'app'; children: React.ReactNode }) {
  const locale = getClientLocale();
  const t = useT();

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="sidebarHeader">
          <div className="brandTitle">
            <span style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--brand)' }} />
            <span style={{ whiteSpace: 'nowrap' }}>ZeroBanner</span>
            <span className="badge" style={{ whiteSpace: 'nowrap' }}>
              Germany-first
            </span>
          </div>
          <div className="sidebarHeaderRight">
            <LanguageSwitch initial={locale} />
          </div>
        </div>
        <div className="nav">
          <Link className={props.active === 'overview' ? 'active' : ''} href="/">
            {t('navMarketing')}
          </Link>
          <Link className={props.active === 'app' ? 'active' : ''} href="/app">
            {t('navDashboard')}
          </Link>
          <Link className={''} href="/app/overview">
            {t('navOverview')}
          </Link>
          <Link className={''} href="/app/projects">
            {t('navProjects')}
          </Link>
          <Link className={''} href="/app/keys">
            {t('navApiKeys')}
          </Link>
          <Link className={''} href="/app/members">
            {t('navMembers')}
          </Link>
          <Link className={''} href="/app/settings">
            {t('navSettings')}
          </Link>
          <Link className={''} href="/app/recommendations">
            {t('navRecommendations')}
          </Link>
          <Link className={''} href="/app/auditor">
            AI Auditor
          </Link>
          <Link className={''} href="/app/benchmarks">
            {t('navBenchmarks')}
          </Link>
          <Link className={props.active === 'setup' ? 'active' : ''} href="/setup">
            Setup
          </Link>
          <Link className={''} href="/login">
            {t('authSignIn')}
          </Link>
        </div>
        <hr className="hr" />
        <div className="sub">
          <div style={{ marginBottom: 10 }}>
            No cookies. No session replay. <b>Math-only</b> aggregation.
          </div>
          <div className="badge">TDDDG §25: no storage</div>
        </div>
      </aside>
      <div className="main">{props.children}</div>
    </div>
  );
}
