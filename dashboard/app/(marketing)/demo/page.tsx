import Link from 'next/link';
import { getT } from '../../i18n/server';

export default async function DemoPage() {
  const t = await getT();
  return (
    <main className="m_sectionAlt">
      <div className="m_container">
        <h1 className="m_h2">{t('mSubDemoTitle')}</h1>
        <div className="m_sub">{t('mSubDemoSubtitle')}</div>
        <div className="m_card" style={{ marginTop: 18 }}>
          <div className="m_cardTitle">{t('mDemoTryTitle')}</div>
          <div className="m_sub">Klicken Sie später auf einen „broken“ Button und sehen Sie sofort die Erklärung + Fix.</div>
        </div>
        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          <Link className="m_btn m_btnPrimary" href="/signup">{t('mPlanStartTrial')}</Link>
          <Link className="m_btn" href="/login">Login</Link>
        </div>
      </div>
    </main>
  );
}
