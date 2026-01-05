import { getT } from '../../i18n/server';

export default async function FeaturesPage() {
  const t = await getT();
  return (
    <main className="m_section">
      <div className="m_container">
        <h1 className="m_h2">{t('mSubFeaturesTitle')}</h1>
        <div className="m_sub">{t('mSubFeaturesSubtitle')}</div>
        <div className="m_cols3" style={{ marginTop: 18 }}>
          <FeatureCard t={t} titleKey="featGrid1Title" bodyKey="featGrid1Body" />
          <FeatureCard t={t} titleKey="featGrid2Title" bodyKey="featGrid2Body" />
          <FeatureCard t={t} titleKey="featGrid3Title" bodyKey="featGrid3Body" />
        </div>
      </div>
    </main>
  );
}

function FeatureCard(props: { t: (k: string) => string; titleKey: string; bodyKey: string }) {
  return (
    <div className="m_card">
      <div className="m_cardTitle">{props.t(props.titleKey)}</div>
      <div className="m_sub">{props.t(props.bodyKey)}</div>
    </div>
  );
}
