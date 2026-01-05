import Link from 'next/link';
import { getT } from '../i18n/server';

export default async function MarketingHome() {
  const t = await getT();
  return (
    <main>
      {/* HERO */}
      <section className="m_hero">
        <div className="m_container">
          <div className="m_grid">
            <div>
              <h1 className="m_h1">{t('mHeroTitle')}</h1>
              <div className="m_sub">{t('mHeroSubtitle')}</div>

              <div className="m_checks">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--m-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>✓</span>
                  {t('mHeroCheck1')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--m-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>✓</span>
                  {t('mHeroCheck2')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--m-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 900, flexShrink: 0 }}>✓</span>
                  {t('mHeroCheck3')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <Link className="m_btn m_btnPrimary" href="/signup">
                  {t('ctaPrimary')}
                </Link>
                <Link className="m_btn" href="/demo">
                  {t('mHeroCtaDemo')}
                </Link>
              </div>

              <div style={{ marginTop: 14, color: 'var(--m-muted)', fontWeight: 600 }}>
                {t('mHeroTrusted')}
              </div>
            </div>

            <div className="m_card" style={{ background: 'var(--m-bg2)', padding: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--m-primary)', marginBottom: 16, letterSpacing: '0.05em' }}>
                {t('mPreviewDashboard')}
              </div>
              
              {/* Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--m-surface)', padding: 16, borderRadius: 10, border: '1px solid var(--m-border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--m-muted)', fontWeight: 600, marginBottom: 8 }}>{t('mPreviewMetric1')}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--m-text)' }}>73</div>
                  <div style={{ fontSize: 11, color: 'var(--m-accent)', fontWeight: 600, marginTop: 4 }}>{t('mPreviewMetric1Change')}</div>
                </div>
                <div style={{ background: 'var(--m-surface)', padding: 16, borderRadius: 10, border: '1px solid var(--m-border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--m-muted)', fontWeight: 600, marginBottom: 8 }}>{t('mPreviewMetric2')}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--m-danger)' }}>234</div>
                  <div style={{ fontSize: 11, color: 'var(--m-danger)', fontWeight: 600, marginTop: 4 }}>{t('mPreviewMetric2Status')}</div>
                </div>
                <div style={{ background: 'var(--m-surface)', padding: 16, borderRadius: 10, border: '1px solid var(--m-border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--m-muted)', fontWeight: 600, marginBottom: 8 }}>{t('mPreviewMetric3')}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--m-warning)' }}>€12.4K</div>
                  <div style={{ fontSize: 11, color: 'var(--m-warning)', fontWeight: 600, marginTop: 4 }}>{t('mPreviewMetric3Period')}</div>
                </div>
              </div>

              {/* Mini Chart */}
              <div style={{ background: 'var(--m-surface)', padding: 16, borderRadius: 10, border: '1px solid var(--m-border)', marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: 'var(--m-muted)', fontWeight: 600, marginBottom: 12 }}>{t('mPreviewChartTitle')}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                  {[28, 32, 29, 38, 27, 34, 58, 45, 68, 52, 38, 29].map((val, i) => (
                    <div key={i} style={{ flex: 1, background: 'var(--m-primary)', borderRadius: '4px 4px 0 0', height: `${val}%`, opacity: 0.7 + (val / 200) }} />
                  ))}
                </div>
              </div>

              {/* AI Recommendation */}
              <div style={{ border: '1px solid var(--m-border)', borderRadius: 12, padding: 16, background: 'var(--m-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--m-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, fontWeight: 900, color: 'white' }}>!</span>
                  <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--m-text)' }}>{t('mPreviewAiTitle')}</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--m-text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                  {t('mPreviewAiProblem')}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--m-danger)', color: 'white', fontSize: 11, fontWeight: 700 }}>{t('mPreviewAiBadge1')}</span>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--m-accent)', color: 'white', fontSize: 11, fontWeight: 700 }}>{t('mPreviewAiBadge2')}</span>
                  <span style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--m-primary)', color: 'white', fontSize: 11, fontWeight: 700 }}>{t('mPreviewAiBadge3')}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--m-muted)', fontStyle: 'italic' }}>
                  {t('mPreviewAiFix')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <h2 className="m_h2">{t('mSocialTitle')}</h2>
          <div className="m_sub">{t('mSocialSubtitle')}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            {['Personio', 'Contentful', 'N26', 'FlixBus', 'HelloFresh', 'Zalando'].map((x) => (
              <span key={x} className="m_pill">
                {x}
              </span>
            ))}
          </div>
          <div className="m_card" style={{ marginTop: 16 }}>
            {t('mSocialQuote')}
            <div style={{ marginTop: 8, color: 'var(--m-muted)' }}>{t('mSocialQuoteBy')}</div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="m_section">
        <div className="m_container">
          <h2 className="m_h2">{t('mProblemTitle')}</h2>
          <div className="m_cols3">
            <div className="m_card">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--m-danger)', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div className="m_cardTitle">{t('mProblem1Title')}</div>
              <div className="m_sub">{t('mProblem1Body')}</div>
            </div>
            <div className="m_card">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--m-warning)', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div className="m_cardTitle">{t('mProblem2Title')}</div>
              <div className="m_sub">{t('mProblem2Body')}</div>
            </div>
            <div className="m_card">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--m-primary-glow)', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className="m_cardTitle">{t('mProblem3Title')}</div>
              <div className="m_sub">{t('mProblem3Body')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <div style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: 8, background: 'var(--m-accent)', color: 'white', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
              OUR SOLUTION
            </div>
            <h2 className="m_h2">{t('mSolutionTitle')}</h2>
          </div>
          <div className="m_cols3">
            <div className="m_card">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--m-accent)', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="m_cardTitle">{t('mSol1Title')}</div>
              <div className="m_sub">{t('mSol1Body')}</div>
            </div>
            <div className="m_card">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--m-primary-glow)', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div className="m_cardTitle">{t('mSol2Title')}</div>
              <div className="m_sub">{t('mSol2Body')}</div>
            </div>
            <div className="m_card">
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/><path d="M1 12h6m6 0h6"/><path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24"/><path d="M19.78 4.22l-4.24 4.24m-5.08 5.08l-4.24 4.24"/></svg>
              </div>
              <div className="m_cardTitle">{t('mSol3Title')}</div>
              <div className="m_sub">{t('mSol3Body')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="m_section">
        <div className="m_container">
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 50 }}>{t('mCompareTitle')}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="m_table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontWeight: 700, fontSize: 15, color: 'var(--m-text)', borderBottom: '2px solid var(--m-border)' }}>{t('mCompareColFeature')}</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontWeight: 700, fontSize: 15, color: 'var(--m-text)', borderBottom: '2px solid var(--m-border)' }}>{t('mCompareColTraditional')}</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontWeight: 700, fontSize: 15, color: 'var(--m-text)', borderBottom: '2px solid var(--m-border)' }}>{t('mCompareColPrivacy')}</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontWeight: 700, fontSize: 15, color: 'var(--m-primary)', borderBottom: '2px solid var(--m-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>{t('mCompareColPriva')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '16px 20px', color: 'var(--m-text-secondary)', borderBottom: '1px solid var(--m-border)' }}>{t('mCompareRowBanner')}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-danger)', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 900 }}>✓</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-surface-hover)', alignItems: 'center', justifyContent: 'center', color: 'var(--m-muted)', fontSize: 16, fontWeight: 900 }}>×</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)', background: 'rgba(99, 102, 241, 0.02)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-accent)', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 900 }}>✓</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '16px 20px', color: 'var(--m-text-secondary)', borderBottom: '1px solid var(--m-border)' }}>{t('mCompareRowWhy')}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-surface-hover)', alignItems: 'center', justifyContent: 'center', color: 'var(--m-muted)', fontSize: 16, fontWeight: 900 }}>×</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-surface-hover)', alignItems: 'center', justifyContent: 'center', color: 'var(--m-muted)', fontSize: 16, fontWeight: 900 }}>×</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)', background: 'rgba(99, 102, 241, 0.02)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-accent)', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 900 }}>✓</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '16px 20px', color: 'var(--m-text-secondary)', borderBottom: '1px solid var(--m-border)' }}>{t('mCompareRowReplay')}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-danger)', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 900 }}>✓</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-surface-hover)', alignItems: 'center', justifyContent: 'center', color: 'var(--m-muted)', fontSize: 16, fontWeight: 900 }}>×</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)', background: 'rgba(99, 102, 241, 0.02)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-accent)', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 900 }}>✓</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '16px 20px', color: 'var(--m-text-secondary)', borderBottom: '1px solid var(--m-border)' }}>{t('mCompareRowFix')}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-surface-hover)', alignItems: 'center', justifyContent: 'center', color: 'var(--m-muted)', fontSize: 16, fontWeight: 900 }}>×</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-surface-hover)', alignItems: 'center', justifyContent: 'center', color: 'var(--m-muted)', fontSize: 16, fontWeight: 900 }}>×</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid var(--m-border)', background: 'rgba(99, 102, 241, 0.02)' }}>
                    <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: 6, background: 'var(--m-accent)', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 900 }}>✓</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '16px 20px', color: 'var(--m-text-secondary)' }}>{t('mCompareRowLocation')}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--m-surface-hover)', color: 'var(--m-text-secondary)', fontSize: 13, fontWeight: 700 }}>US</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--m-surface-hover)', color: 'var(--m-text-secondary)', fontSize: 13, fontWeight: 700 }}>EU</span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', background: 'rgba(99, 102, 241, 0.02)' }}>
                    <span style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--m-accent)', color: 'white', fontSize: 13, fontWeight: 700 }}>DE</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PRICING (placeholder) */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <h2 className="m_h2">{t('mPricingTitle')}</h2>
          <div className="m_sub">{t('mPricingSubtitle')}</div>
          <div className="m_cols3">
            <div className="m_card">
              <div className="m_cardTitle">{t('mPlanStarter')}</div>
              <div style={{ fontWeight: 900, fontSize: 26, marginTop: 10 }}>€49</div>
              <div className="m_sub">{t('mPlanPerMonth')}</div>
              <div className="m_sub" style={{ marginTop: 10 }}>{t('mPlanDescStarter')}</div>
              <div style={{ marginTop: 12 }}>
                <Link className="m_btn m_btnPrimary" href="/signup">{t('mPlanStartTrial')}</Link>
              </div>
            </div>
            <div className="m_card" style={{ borderColor: 'rgba(99,102,241,0.35)' }}>
              <div className="m_cardTitle">{t('mPlanGrowth')}</div>
              <div style={{ fontWeight: 900, fontSize: 26, marginTop: 10 }}>€149</div>
              <div className="m_sub">{t('mPlanPerMonth')}</div>
              <div className="m_sub" style={{ marginTop: 10 }}>{t('mPlanDescGrowth')}</div>
              <div style={{ marginTop: 12 }}>
                <Link className="m_btn m_btnPrimary" href="/signup">{t('mPlanStartTrial')}</Link>
              </div>
            </div>
            <div className="m_card">
              <div className="m_cardTitle">{t('mPlanBusiness')}</div>
              <div style={{ fontWeight: 900, fontSize: 26, marginTop: 10 }}>€299</div>
              <div className="m_sub">{t('mPlanPerMonth')}</div>
              <div className="m_sub" style={{ marginTop: 10 }}>{t('mPlanDescBusiness')}</div>
              <div style={{ marginTop: 12 }}>
                <Link className="m_btn m_btnPrimary" href="/signup">{t('mPlanStartTrial')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="m_section">
        <div className="m_container">
          <div className="m_card" style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div className="m_h2" style={{ fontSize: 22 }}>{t('mFinalCtaTitle')}</div>
              <div className="m_sub">{t('mFinalCtaSubtitle')}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link className="m_btn m_btnPrimary" href="/signup">{t('ctaPrimary')}</Link>
              <Link className="m_btn" href="/login">{t('authSignIn')}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
