import Link from 'next/link';
import { getT } from '../../i18n/server';

export default async function PricingPage() {
  const t = await getT();
  return (
    <main className="m_section">
      <div className="m_container">
        <h1 className="m_h2">{t('mPricingTitle')}</h1>
        <div className="m_sub">{t('mPricingSubtitle')}</div>
        <div className="m_cols3" style={{ marginTop: 18 }}>
          <Plan t={t} name={t('mPlanStarter')} price="€49" desc={t('mPlanDescStarter')} bulletsKey="mPlanStarterBullets" />
          <Plan t={t} name={t('mPlanGrowth')} price="€149" desc={t('mPlanDescGrowth')} bulletsKey="mPlanGrowthBullets" highlight />
          <Plan t={t} name={t('mPlanBusiness')} price="€299" desc={t('mPlanDescBusiness')} bulletsKey="mPlanBusinessBullets" />
        </div>
        <AllPlansInclude t={t} />
        <div style={{ marginTop: 18 }}>
          <Link className="m_btn m_btnPrimary" href="/signup">{t('mPlanStartTrial')}</Link>
        </div>
      </div>
    </main>
  );
}

function splitBullets(t: (k: string) => string, key: string): string[] {
  const raw = t(key);
  return raw.split('||').map((s) => s.trim()).filter(Boolean);
}

function AllPlansInclude(props: { t: (k: string) => string }) {
  const bullets = splitBullets(props.t, 'mAllPlansIncludeBullets');
  return (
    <div className="m_card" style={{ marginTop: 18 }}>
      <div className="m_cardTitle">{props.t('mAllPlansIncludeTitle')}</div>
      <ul style={{ marginTop: 10, paddingLeft: 18, color: 'var(--m-muted)' }}>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

function Plan(props: {
  t: (k: string) => string;
  name: string;
  price: string;
  desc: string;
  bulletsKey: string;
  highlight?: boolean;
}) {
  const bullets = splitBullets(props.t, props.bulletsKey);
  return (
    <div className="m_card" style={props.highlight ? { borderColor: 'rgba(99,102,241,0.35)' } : undefined}>
      <div className="m_cardTitle">{props.name}</div>
      <div style={{ fontWeight: 900, fontSize: 30, marginTop: 10 }}>{props.price}</div>
      <div className="m_sub">{props.t('mPlanPerMonth')}</div>
      <div className="m_sub" style={{ marginTop: 10 }}>{props.desc}</div>
      <ul style={{ marginTop: 12, paddingLeft: 18, color: 'var(--m-muted)' }}>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
