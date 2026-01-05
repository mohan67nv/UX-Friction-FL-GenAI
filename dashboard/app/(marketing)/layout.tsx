import '../marketing.css';
import '../marketing-animations.css';
import Link from 'next/link';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { getLocale, getT } from '../i18n/server';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getT();

  return (
    <div className="marketing">
      <header className="m_nav">
        <div className="m_nav_inner">
          <Link href="/" className="m_brand" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, var(--m-primary), var(--m-primary2))',
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: 22, fontWeight: 900 }}>ZeroBanner</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--m-text-secondary)', letterSpacing: '-0.01em', paddingLeft: 24 }}>
              100% Visibility. 0% Cookies
            </div>
          </Link>

          <nav className="m_menu" aria-label="primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center', margin: '0 20px' }}>
            <Link href="/features">{t('navProduct')}</Link>
            <Link href="/pricing">{t('navPricing')}</Link>
            <Link href="/customers">{t('navCustomers')}</Link>
            <Link href="/docs">{t('navDocs')}</Link>
            <Link href="/blog">{t('navBlog')}</Link>
          </nav>

          <div className="m_actions">
            <LanguageSwitch initial={locale} />
            <Link className="m_btn" href="/login">
              {t('authSignIn')}
            </Link>
            <Link className="m_btn m_btnPrimary" href="/signup">
              {t('ctaPrimary')}
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="m_footer">
        <div className="m_container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 900, color: 'var(--m-text)' }}>ZeroBanner</div>
              <div style={{ marginTop: 8 }}>{t('tagline')}</div>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span className="m_pill" style={{ background: 'var(--m-primary)', color: 'white' }}>🇩🇪 Germany‑first</span>
                <span style={{ color: 'var(--m-muted)' }}>Made in Germany • 100% EU‑hosted</span>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--m-text)' }}>{t('mFooterProduct')}</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                <Link href="/features">Features</Link>
                <Link href="/pricing">{t('navPricing')}</Link>
                <Link href="/demo">Demo</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--m-text)' }}>{t('mFooterResources')}</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                <Link href="/docs">Docs</Link>
                <Link href="/blog">Blog</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--m-text)' }}>{t('mFooterLegal')}</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                <Link href="/privacy">{t('mFooterPrivacy')}</Link>
                <Link href="/impressum">{t('mFooterImprint')}</Link>
                <Link href="/terms">{t('mFooterTerms')}</Link>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>© 2026 ZeroBanner GmbH</div>
        </div>
      </footer>
    </div>
  );
}
