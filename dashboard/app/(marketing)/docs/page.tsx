import { getT } from '../../i18n/server';
import Link from 'next/link';

export default async function DocsPage() {
  const t = await getT();
  return (
    <main>
      {/* Hero */}
      <section className="m_hero" style={{ paddingTop: 80, paddingBottom: 60 }}>
        <div className="m_container">
          <h1 className="m_h1">{t('docsHeroTitle')}</h1>
          <div className="m_sub" style={{ fontSize: 19, maxWidth: 700, margin: '20px auto 0' }}>
            {t('docsHeroSub')}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="m_section" style={{ paddingTop: 0 }}>
        <div className="m_container">
          <div className="m_card" style={{ padding: 40, background: 'var(--m-bg2)' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20, color: 'var(--m-text)' }}>
              {t('docsQuickTitle')}
            </h2>
            <div className="m_sub" style={{ marginBottom: 30, fontSize: 17 }}>
              {t('docsQuickSub')}
            </div>
            
            <div style={{ background: 'var(--m-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--m-border)' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--m-text-secondary)' }}>
                <div style={{ color: 'var(--m-muted)', marginBottom: 8 }}>{'<!-- Add to <head> -->'}</div>
                <div>{'<script src="https://cdn.zerobanner.de/edge-ai.js"'}</div>
                <div>{'        data-project-id="your-enterprise-id"'}</div>
                <div style={{ color: 'var(--m-primary)' }}>{'        data-edge-ai="true"'}</div>
                <div style={{ color: 'var(--m-primary)' }}>{'        data-federated-learning="true"'}</div>
                <div>{'        data-mode="autonomous"></script>'}</div>
              </div>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/signup" className="m_btn m_btnPrimary">
                {t('docsGenKeys')}
              </Link>
              <button className="m_btn">{t('docsCopyScript')}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Docs Grid */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 50 }}>{t('docsPlatTitle')}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
            {/* Edge AI */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>🧠</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                {t('docsEdgeTitle')}
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                {t('docsEdgeSub')}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/edge-initialization" style={{ color: 'var(--m-primary)' }}>{t('docsEdge1')}</Link></li>
                <li><Link href="/docs/custom-heuristics" style={{ color: 'var(--m-primary)' }}>{t('docsEdge2')}</Link></li>
                <li><Link href="/docs/local-inference" style={{ color: 'var(--m-primary)' }}>{t('docsEdge3')}</Link></li>
                <li><Link href="/docs/performance-impact" style={{ color: 'var(--m-primary)' }}>{t('docsEdge4')}</Link></li>
              </ul>
            </div>

            {/* RAG Integration */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                {t('docsRagTitle')}
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                {t('docsRagSub')}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/rag-api" style={{ color: 'var(--m-primary)' }}>{t('docsRag1')}</Link></li>
                <li><Link href="/docs/vector-stores" style={{ color: 'var(--m-primary)' }}>{t('docsRag2')}</Link></li>
                <li><Link href="/docs/context-injection" style={{ color: 'var(--m-primary)' }}>{t('docsRag3')}</Link></li>
                <li><Link href="/docs/llm-prompts" style={{ color: 'var(--m-primary)' }}>{t('docsRag4')}</Link></li>
              </ul>
            </div>

            {/* Federated Infrastructure */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>🌐</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                {t('docsFedTitle')}
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                {t('docsFedSub')}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/federated-overview" style={{ color: 'var(--m-primary)' }}>{t('docsFed1')}</Link></li>
                <li><Link href="/docs/aggregation-server" style={{ color: 'var(--m-primary)' }}>{t('docsFed2')}</Link></li>
                <li><Link href="/docs/gradient-encryption" style={{ color: 'var(--m-primary)' }}>{t('docsFed3')}</Link></li>
                <li><Link href="/docs/self-hosted" style={{ color: 'var(--m-primary)' }}>{t('docsFed4')}</Link></li>
              </ul>
            </div>

            {/* Privacy & Compliance */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                {t('docsPrivTitle')}
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                {t('docsPrivSub')}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/tdddg-exemption" style={{ color: 'var(--m-primary)' }}>{t('docsPriv1')}</Link></li>
                <li><Link href="/docs/gdpr" style={{ color: 'var(--m-primary)' }}>{t('docsPriv2')}</Link></li>
                <li><Link href="/docs/zero-pii" style={{ color: 'var(--m-primary)' }}>{t('docsPriv3')}</Link></li>
                <li><Link href="/docs/differential-privacy" style={{ color: 'var(--m-primary)' }}>{t('docsPriv4')}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="m_section">
        <div className="m_container">
          <h2 className="m_h2" style={{ marginBottom: 40 }}>{t('docsApiTitle')}</h2>
          
          <div style={{ display: 'grid', gap: 30 }}>
            {/* Example 1 */}
            <div className="m_card">
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: 'var(--m-text)' }}>
                {t('docsApi1')}
              </h3>
              <div style={{ background: 'var(--m-bg2)', padding: 20, borderRadius: 10, border: '1px solid var(--m-border)' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--m-text-secondary)' }}>
                  <div style={{ color: 'var(--m-muted)' }}>{'// Ask the LLM why conversions dropped on mobile in the last 24h'}</div>
                  <div>{'const response = await ZeroBannerAPI.queryAI({'}</div>
                  <div>{'  prompt: "Analyze friction patterns for mobile checkout drop-offs",'}</div>
                  <div>{'  context: "latest_release_v2.4",'}</div>
                  <div>{'  timeframe: "24h"'}</div>
                  <div>{'});'}</div>
                  <br/>
                  <div style={{ color: 'var(--m-primary)' }}>{'// Returns Actionable Diagnostic:'}</div>
                  <div style={{ color: 'var(--m-primary)' }}>{'// "Users are rage-clicking the \'Apply Promo\' button. CSS overlaps the input on iPhone 12/13 screens."'}</div>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="m_card">
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: 'var(--m-text)' }}>
                {t('docsApi2')}
              </h3>
              <div style={{ background: 'var(--m-bg2)', padding: 20, borderRadius: 10, border: '1px solid var(--m-border)' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--m-text-secondary)' }}>
                  <div style={{ color: 'var(--m-muted)' }}>{'// Train the local edge-model to flag specific layout shift anomalies'}</div>
                  <div>{'ZeroBanner.EdgeAI.setHeuristics({'}</div>
                  <div>{'  rageClickThreshold: 3, // ms between clicks'}</div>
                  <div>{'  deadClickDetection: true,'}</div>
                  <div>{'  layoutShiftTolerance: 0.1,'}</div>
                  <div>{'  onFrictionDetected: (anomaly) => {'}</div>
                  <div style={{ color: 'var(--m-muted)' }}>{'    // Encrypt and send gradient update to central server'}</div>
                  <div>{'    ZeroBanner.Federated.dispatch(anomaly.gradient);'}</div>
                  <div>{'  }'}</div>
                  <div>{'});'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <div className="m_card" style={{ textAlign: 'center', padding: 60 }}>
            <h2 className="m_h2" style={{ marginBottom: 16 }}>{t('docsSupTitle')}</h2>
            <div className="m_sub" style={{ fontSize: 17, marginBottom: 30, maxWidth: 600, margin: '0 auto 30px' }}>
              {t('docsSupSub')}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/demo" className="m_btn m_btnPrimary" style={{ padding: '14px 32px' }}>
                {t('docsSupContact')}
              </Link>
              <a href="mailto:enterprise@zerobanner.de" className="m_btn" style={{ padding: '14px 32px' }}>
                {t('docsSupEmail')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
