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
          <Link href="/" className="m_brand" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/zerobanner-logo.png" alt="ZeroBanner Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen', transform: 'scale(2.2)', marginTop: 6 }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--m-text)' }}>ZeroBanner</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--m-muted)', letterSpacing: '0.02em', paddingLeft: 40, marginTop: -4 }}>
              100% Visibility. 0% Cookies
            </div>
          </Link>

          <nav className="m_menu" aria-label="primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center', margin: '0 20px' }}>
            <Link href="/">{t('navHome')}</Link>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, color: 'var(--m-text)' }}>
                <img src="/zerobanner-logo.png" alt="Logo" style={{ width: 24, height: 24, mixBlendMode: 'screen' }} />
                ZeroBanner
              </div>
              <div style={{ marginTop: 8 }}>{t('tagline')}</div>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span className="m_pill" style={{ background: 'var(--m-primary)', color: 'white' }}>{t('mFooterBadgeDE')}</span>
                <span style={{ color: 'var(--m-muted)' }}>{t('mFooterMadeIn')}</span>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--m-text)' }}>{t('mFooterProduct')}</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                <Link href="/features">{t('navProduct')}</Link>
                <Link href="/pricing">{t('navPricing')}</Link>
                <Link href="/demo">{t('navDemo')}</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--m-text)' }}>{t('mFooterResources')}</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                <Link href="/docs">{t('navDocs')}</Link>
                <Link href="/blog">{t('navBlog')}</Link>
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
          <div style={{ marginTop: 18 }}>{t('mFooterCopyright')}</div>
        </div>
      </footer>
    </div>
  );
}
