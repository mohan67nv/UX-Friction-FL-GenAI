import { getT } from '../../i18n/server';
import Link from 'next/link';

export default async function CustomersPage() {
  const t = await getT();
  return (
    <main>
      {/* Hero */}
      <section className="m_hero">
        <div className="m_container">
          <h1 className="m_h1">Trusted by Leading German Companies</h1>
          <div className="m_sub" style={{ fontSize: 19, maxWidth: 700, margin: '20px auto 0' }}>
            Privacy-first teams choose ZeroBanner to understand user behavior without compromising data protection.
          </div>
        </div>
      </section>

      {/* Customer Logos */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="m_sub">Powering UX analytics for:</div>
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
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 50 }}>Customer Success Stories</h2>
          
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
                    "We reduced checkout friction by 47% in 3 weeks using ZeroBanner's AI recommendations. 
                    Best part? No cookie banner needed, so we kept 100% of our analytics data."
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span className="m_pill">+47% Conversion</span>
                    <span className="m_pill">€85K Additional Revenue</span>
                    <span className="m_pill">100% Data Retention</span>
                  </div>
                  <div style={{ marginTop: 16, color: 'var(--m-muted)', fontSize: 14, fontWeight: 600 }}>
                    — Lisa Schmidt, Head of Product
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
                    "ZeroBanner identified a Safari CSS bug causing 234 rage-clicks per week. 
                    Fixed it in 15 minutes, recovered €12.4K monthly revenue. ROI: 2,480%."
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span className="m_pill">15 Min Fix</span>
                    <span className="m_pill">€12.4K/Month Recovered</span>
                    <span className="m_pill">2,480% ROI</span>
                  </div>
                  <div style={{ marginTop: 16, color: 'var(--m-muted)', fontSize: 14, fontWeight: 600 }}>
                    — Marcus Weber, CTO
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
                    "As a regulated financial service, we can't use Google Analytics or Hotjar. 
                    ZeroBanner gave us enterprise-grade UX insights while staying 100% DSGVO compliant."
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span className="m_pill">100% DSGVO Compliant</span>
                    <span className="m_pill">BaFin Approved</span>
                    <span className="m_pill">No Legal Risk</span>
                  </div>
                  <div style={{ marginTop: 16, color: 'var(--m-muted)', fontSize: 14, fontWeight: 600 }}>
                    — Dr. Anna Müller, Compliance Officer
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
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 50 }}>Impact Across Industries</h2>
          <div className="m_cols3">
            <div className="m_card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--m-primary)', marginBottom: 10 }}>€3.2M</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--m-text)' }}>Revenue Recovered</div>
              <div className="m_sub" style={{ marginTop: 8 }}>Across all customers in 2025</div>
            </div>
            <div className="m_card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--m-primary)', marginBottom: 10 }}>47%</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--m-text)' }}>Avg Friction Reduction</div>
              <div className="m_sub" style={{ marginTop: 8 }}>Within first 30 days</div>
            </div>
            <div className="m_card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--m-primary)', marginBottom: 10 }}>100%</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--m-text)' }}>Data Retention</div>
              <div className="m_sub" style={{ marginTop: 8 }}>No cookie banner = no rejection</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="m_section">
        <div className="m_container">
          <div className="m_card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <h2 className="m_h2" style={{ marginBottom: 16 }}>Join Leading German Companies</h2>
            <div className="m_sub" style={{ fontSize: 18, maxWidth: 600, margin: '0 auto 30px' }}>
              Start recovering lost revenue with privacy-first UX analytics.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="m_btn m_btnPrimary" style={{ padding: '14px 32px', fontSize: 16 }}>
                Start Free Trial
              </Link>
              <Link href="/demo" className="m_btn" style={{ padding: '14px 32px', fontSize: 16 }}>
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
