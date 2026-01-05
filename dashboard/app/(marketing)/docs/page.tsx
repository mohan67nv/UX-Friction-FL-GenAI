import { getT } from '../../i18n/server';
import Link from 'next/link';

export default async function DocsPage() {
  const t = await getT();
  return (
    <main>
      {/* Hero */}
      <section className="m_hero" style={{ paddingTop: 80, paddingBottom: 60 }}>
        <div className="m_container">
          <h1 className="m_h1">Documentation</h1>
          <div className="m_sub" style={{ fontSize: 19, maxWidth: 700, margin: '20px auto 0' }}>
            Everything you need to integrate ZeroBanner, from 5-minute quickstart to advanced self-hosted deployments.
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="m_section" style={{ paddingTop: 0 }}>
        <div className="m_container">
          <div className="m_card" style={{ padding: 40, background: 'var(--m-bg2)' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 20, color: 'var(--m-text)' }}>
              ⚡ 5-Minute Quickstart
            </h2>
            <div className="m_sub" style={{ marginBottom: 30, fontSize: 17 }}>
              Add one script tag. Start getting privacy-first UX insights immediately. No configuration needed.
            </div>
            
            <div style={{ background: 'var(--m-surface)', padding: 24, borderRadius: 12, border: '1px solid var(--m-border)' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--m-text-secondary)' }}>
                <div style={{ color: 'var(--m-muted)', marginBottom: 8 }}>{'<!-- Add to <head> -->'}</div>
                <div>{'<script src="https://cdn.zerobanner.de/sdk.js"'}</div>
                <div>{'        data-project-id="your-project-id"'}</div>
                <div>{'        data-mode="saas"></script>'}</div>
              </div>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/signup" className="m_btn m_btnPrimary">
                Get Your Project ID →
              </Link>
              <button className="m_btn">Copy Code</button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Docs Grid */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 50 }}>Documentation</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
            {/* Getting Started */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                Getting Started
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                Installation, configuration, and your first UX insights in minutes.
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/install" style={{ color: 'var(--m-primary)' }}>→ Installation Guide</Link></li>
                <li><Link href="/docs/quickstart" style={{ color: 'var(--m-primary)' }}>→ 5-Minute Quickstart</Link></li>
                <li><Link href="/docs/project-setup" style={{ color: 'var(--m-primary)' }}>→ Project Setup</Link></li>
                <li><Link href="/docs/first-insights" style={{ color: 'var(--m-primary)' }}>→ Your First Insights</Link></li>
              </ul>
            </div>

            {/* SDK Reference */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                SDK & API Reference
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                Complete API documentation, SDK methods, and code examples.
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/javascript-sdk" style={{ color: 'var(--m-primary)' }}>→ JavaScript SDK</Link></li>
                <li><Link href="/docs/rest-api" style={{ color: 'var(--m-primary)' }}>→ REST API</Link></li>
                <li><Link href="/docs/webhooks" style={{ color: 'var(--m-primary)' }}>→ Webhooks</Link></li>
                <li><Link href="/docs/api-keys" style={{ color: 'var(--m-primary)' }}>→ API Key Management</Link></li>
              </ul>
            </div>

            {/* Integrations */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                Integrations
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                Connect ZeroBanner with your existing tools and workflows.
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/next-js" style={{ color: 'var(--m-primary)' }}>→ Next.js Integration</Link></li>
                <li><Link href="/docs/react" style={{ color: 'var(--m-primary)' }}>→ React Integration</Link></li>
                <li><Link href="/docs/vue" style={{ color: 'var(--m-primary)' }}>→ Vue.js Integration</Link></li>
                <li><Link href="/docs/wordpress" style={{ color: 'var(--m-primary)' }}>→ WordPress Plugin</Link></li>
              </ul>
            </div>

            {/* Self-Hosted */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>🏠</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                Self-Hosted
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                Deploy ZeroBanner on your own infrastructure with full control.
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/docker-compose" style={{ color: 'var(--m-primary)' }}>→ Docker Compose</Link></li>
                <li><Link href="/docs/kubernetes" style={{ color: 'var(--m-primary)' }}>→ Kubernetes</Link></li>
                <li><Link href="/docs/air-gapped" style={{ color: 'var(--m-primary)' }}>→ Air-Gapped Mode</Link></li>
                <li><Link href="/docs/backup" style={{ color: 'var(--m-primary)' }}>→ Backup & Recovery</Link></li>
              </ul>
            </div>

            {/* Privacy & Compliance */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                Privacy & Compliance
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                GDPR, TDDDG, and privacy-by-design architecture explained.
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/gdpr-compliance" style={{ color: 'var(--m-primary)' }}>→ GDPR Compliance</Link></li>
                <li><Link href="/docs/tdddg" style={{ color: 'var(--m-primary)' }}>→ TDDDG §25</Link></li>
                <li><Link href="/docs/federated-learning" style={{ color: 'var(--m-primary)' }}>→ Federated Learning</Link></li>
                <li><Link href="/docs/data-flow" style={{ color: 'var(--m-primary)' }}>→ Data Flow Diagram</Link></li>
              </ul>
            </div>

            {/* Advanced */}
            <div className="m_card">
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                Advanced Topics
              </h3>
              <div className="m_sub" style={{ marginBottom: 20 }}>
                Custom implementations, performance tuning, and architecture.
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                <li><Link href="/docs/custom-events" style={{ color: 'var(--m-primary)' }}>→ Custom Events</Link></li>
                <li><Link href="/docs/performance" style={{ color: 'var(--m-primary)' }}>→ Performance Tuning</Link></li>
                <li><Link href="/docs/architecture" style={{ color: 'var(--m-primary)' }}>→ System Architecture</Link></li>
                <li><Link href="/docs/troubleshooting" style={{ color: 'var(--m-primary)' }}>→ Troubleshooting</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="m_section">
        <div className="m_container">
          <h2 className="m_h2" style={{ marginBottom: 40 }}>Popular Code Examples</h2>
          
          <div style={{ display: 'grid', gap: 30 }}>
            {/* Example 1 */}
            <div className="m_card">
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: 'var(--m-text)' }}>
                Track Custom Events
              </h3>
              <div style={{ background: 'var(--m-bg2)', padding: 20, borderRadius: 10, border: '1px solid var(--m-border)' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--m-text-secondary)' }}>
                  <div style={{ color: 'var(--m-muted)' }}>// Track button clicks</div>
                  <div>{'ZeroBanner.track(\'checkout_started\', {'}</div>
                  <div>{'  value: 89.99,'}</div>
                  <div>{'  currency: \'EUR\''}</div>
                  <div>{'});'}</div>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div className="m_card">
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: 'var(--m-text)' }}>
                Next.js Integration
              </h3>
              <div style={{ background: 'var(--m-bg2)', padding: 20, borderRadius: 10, border: '1px solid var(--m-border)' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--m-text-secondary)' }}>
                  <div style={{ color: 'var(--m-muted)' }}>// app/layout.tsx</div>
                  <div>{'import { ZeroBannerProvider } from \'@privacymanu/next\''}</div>
                  <div>{''}</div>
                  <div>{'export default function RootLayout({ children }) {'}</div>
                  <div>{'  return <ZeroBannerProvider projectId="...">{ children }</ZeroBannerProvider>'}</div>
                  <div>{'}'}</div>
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
            <h2 className="m_h2" style={{ marginBottom: 16 }}>Need Help?</h2>
            <div className="m_sub" style={{ fontSize: 17, marginBottom: 30, maxWidth: 600, margin: '0 auto 30px' }}>
              Our team is here to help you get started with ZeroBanner.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/demo" className="m_btn m_btnPrimary" style={{ padding: '14px 32px' }}>
                Book a Demo
              </Link>
              <a href="mailto:support@zerobanner.de" className="m_btn" style={{ padding: '14px 32px' }}>
                Email Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
