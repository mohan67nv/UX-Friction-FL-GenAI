import Link from 'next/link';
import { Shell } from './components/Shell';
import { getT } from './i18n/server';

export default async function Page() {
  const t = await getT();
  return (
    <Shell active="overview">
      <div className="topbar">
        <div>
          <div className="h1">{t('tagline')}</div>
          <div className="sub">{t('heroSubtitle')}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link className="btn" href="/signup">
            {t('ctaPrimary')}
          </Link>
          <Link className="btn btnSecondary" href="/login">
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 12' }}>
          <h3>{t('heroTitle')}</h3>
          <div className="sub" style={{ fontSize: 15, lineHeight: 1.5 }}>
            {t('heroSubtitle')}
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 4' }}>
          <h3>{t('feature1Title')}</h3>
          <div className="sub">{t('feature1Body')}</div>
        </div>
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <h3>{t('feature2Title')}</h3>
          <div className="sub">{t('feature2Body')}</div>
        </div>
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <h3>{t('feature3Title')}</h3>
          <div className="sub">{t('feature3Body')}</div>
        </div>

        <div className="card" style={{ gridColumn: 'span 12' }}>
          <h3>{t('marketingLiveDemo')}</h3>
          <div className="sub">{t('marketingAfterLogin')}</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <Link className="btn" href="/app">
              {t('marketingOpenDashboard')}
            </Link>
            <Link className="btn btnSecondary" href="/setup">
              {t('marketingIntegrationSetup')}
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
