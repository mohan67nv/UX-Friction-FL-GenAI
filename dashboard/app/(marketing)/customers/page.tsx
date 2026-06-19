import { getT } from '../../i18n/server';
import Link from 'next/link';

export default async function CustomersPage() {
  const t = await getT();
  return (
    <main>
      {/* Hero */}
      <section className="m_hero">
        <div className="m_container">
          <h1 className="m_h1">{t('custHeroTitle')}</h1>
          <div className="m_sub" style={{ fontSize: 19, maxWidth: 700, margin: '20px auto 0' }}>
            {t('custHeroSub')}
          </div>
        </div>
      </section>

      {/* Customer Logos */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="m_sub">{t('custPowering')}</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, justifyContent: 'center', alignItems: 'center' }}>
            {['SaaS Startup GmbH', 'E-Commerce Pro', 'FinTech Berlin', 'HealthTech Munich', 'EduTech Hamburg', 'TravelTech Cologne'].map((company) => (
              <div key={company} className="m_pill" style={{ fontSize: 16, padding: '12px 24px' }}>
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Stories */}
      <section className="m_section">
        <div className="m_container">
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 50 }}>{t('custStories')}</h2>
          
          <div style={{ display: 'grid', gap: 40 }}>
            {/* Story 1 */}
            <div className="m_card">
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 40, alignItems: 'start' }}>
                <div>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--m-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    🚀
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>SaaS Startup GmbH</h3>
                  <div className="m_sub" style={{ marginBottom: 16, fontSize: 16 }}>
                    {t('cust1Quote')}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span className="m_pill">{t('cust1P1')}</span>
                    <span className="m_pill">{t('cust1P2')}</span>
                    <span className="m_pill">{t('cust1P3')}</span>
                  </div>
                  <div style={{ marginTop: 16, color: 'var(--m-muted)', fontSize: 14, fontWeight: 600 }}>
                    {t('cust1Author')}
                  </div>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="m_card">
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 40, alignItems: 'start' }}>
                <div>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--m-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    🛒
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>E-Commerce Pro</h3>
                  <div className="m_sub" style={{ marginBottom: 16, fontSize: 16 }}>
                    {t('cust2Quote')}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span className="m_pill">{t('cust2P1')}</span>
                    <span className="m_pill">{t('cust2P2')}</span>
                    <span className="m_pill">{t('cust2P3')}</span>
                  </div>
                  <div style={{ marginTop: 16, color: 'var(--m-muted)', fontSize: 14, fontWeight: 600 }}>
                    {t('cust2Author')}
                  </div>
                </div>
              </div>
            </div>

            {/* Story 3 */}
            <div className="m_card">
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 40, alignItems: 'start' }}>
                <div>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--m-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    🏦
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>FinTech Berlin</h3>
                  <div className="m_sub" style={{ marginBottom: 16, fontSize: 16 }}>
                    {t('cust3Quote')}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span className="m_pill">{t('cust3P1')}</span>
                    <span className="m_pill">{t('cust3P2')}</span>
                    <span className="m_pill">{t('cust3P3')}</span>
                  </div>
                  <div style={{ marginTop: 16, color: 'var(--m-muted)', fontSize: 14, fontWeight: 600 }}>
                    {t('cust3Author')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 50 }}>{t('custImpact')}</h2>
          <div className="m_cols3">
            <div className="m_card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--m-primary)', marginBottom: 10 }}>{t('custImpact1V')}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--m-text)' }}>{t('custImpact1T')}</div>
              <div className="m_sub" style={{ marginTop: 8 }}>{t('custImpact1D')}</div>
            </div>
            <div className="m_card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--m-primary)', marginBottom: 10 }}>{t('custImpact2V')}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--m-text)' }}>{t('custImpact2T')}</div>
              <div className="m_sub" style={{ marginTop: 8 }}>{t('custImpact2D')}</div>
            </div>
            <div className="m_card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--m-primary)', marginBottom: 10 }}>{t('custImpact3V')}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--m-text)' }}>{t('custImpact3T')}</div>
              <div className="m_sub" style={{ marginTop: 8 }}>{t('custImpact3D')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="m_section">
        <div className="m_container">
          <div className="m_card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <h2 className="m_h2" style={{ marginBottom: 16 }}>{t('custJoinTitle')}</h2>
            <div className="m_sub" style={{ fontSize: 18, maxWidth: 600, margin: '0 auto 30px' }}>
              {t('custJoinSub')}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="m_btn m_btnPrimary" style={{ padding: '14px 32px', fontSize: 16 }}>
                {t('custJoinFree')}
              </Link>
              <Link href="/demo" className="m_btn" style={{ padding: '14px 32px', fontSize: 16 }}>
                {t('custJoinDemo')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
