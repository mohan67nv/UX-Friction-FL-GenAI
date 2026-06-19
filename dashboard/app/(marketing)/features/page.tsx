import Link from 'next/link';
import Image from 'next/image';
import { getT } from '../../i18n/server';

export default async function FeaturesPage() {
  const t = await getT();
  return (
    <main style={{ paddingBottom: 100 }}>
      {/* HEADER */}
      <section className="m_section" style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 40 }}>
        <div className="m_container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: 20, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--m-primary)', fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
            {t('featBadge')}
          </div>
          <h2 className="m_h2" style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: 1.2, marginBottom: 16 }}>
            {t('featHeroTitle')}
          </h2>
          <div className="m_sub" style={{ fontSize: 18, color: 'var(--m-text-secondary)' }}>
            {t('featHeroSub')}
          </div>
          
          <div style={{ marginTop: 60, width: '100%', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--m-border)', background: 'var(--m-surface)' }}>
            <img 
              src="/zerobanner-how-it-works.svg" 
              alt="How ZeroBanner Works" 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
          </div>
        </div>
      </section>

      {/* RAG/LLM EXPLANATION */}
      <section className="m_sectionAlt" style={{ padding: '60px 20px' }}>
        <div className="m_container">
          <div className="m_grid" style={{ alignItems: 'start' }}>
            {/* Left: The Magic */}
            <div className="m_card" style={{ border: '1px solid var(--m-border)', background: 'var(--m-surface)' }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{t('featLegacyTitle')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--m-text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                <li style={{ marginBottom: 10 }}>• {t('featLegacy1')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featLegacy2')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featLegacy3')}</li>
              </ul>
              
              <div style={{ height: 1, background: 'var(--m-border)', margin: '24px 0' }} />
              
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: 'var(--m-primary)' }}>{t('featAiTitle')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--m-text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                <li style={{ marginBottom: 10 }}>• {t('featAi1')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featAi2')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featAi3')}</li>
              </ul>
              <div style={{ padding: 16, background: 'var(--m-bg2)', borderRadius: 8, border: '1px solid var(--m-border)', marginTop: 24, fontSize: 14 }}>
                <strong>{t('featRagTitle')}</strong><br />
                {t('featRagSub')}
              </div>
            </div>

            {/* Right: Business Impact */}
            <div className="m_card" style={{ border: '2px solid var(--m-primary)', background: 'var(--m-bg2)' }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>{t('featImpactTitle')}</h3>
              
              <div style={{ marginBottom: 32 }}>
                <strong style={{ color: 'var(--m-text)', fontSize: 16, borderBottom: '1px solid var(--m-danger)', paddingBottom: 4 }}>{t('featImpact1Title')}</strong>
                <div style={{ color: 'var(--m-text-secondary)', fontSize: 15, marginTop: 12, lineHeight: 1.6 }}>
                  {t('featImpact1Desc')}<br />
                  <span style={{ display: 'inline-block', marginTop: 8, color: 'var(--m-danger)', fontWeight: 700 }}>{t('featImpact1Risk')}</span>
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--m-text)', fontSize: 16, borderBottom: '1px solid var(--m-accent)', paddingBottom: 4 }}>{t('featImpact2Title')}</strong>
                <div style={{ color: 'var(--m-text-secondary)', fontSize: 15, marginTop: 12, lineHeight: 1.6 }}>
                  {t('featImpact2Desc')}<br />
                  <span style={{ display: 'inline-block', marginTop: 8, color: 'var(--m-accent)', fontWeight: 700 }}>{t('featImpact2Result')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE CAPABILITIES */}
      <section className="m_section" style={{ padding: '80px 20px' }}>
        <div className="m_container">
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 40 }}>{t('featCapTitle')}</h2>
          
          <div className="m_grid" style={{ alignItems: 'start' }}>
            <div className="m_card" style={{ background: 'var(--m-surface)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{t('featVisTitle')}</h3>
              <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', marginBottom: 16 }}>{t('featVisSub')}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--m-text-secondary)' }}>
                <li style={{ marginBottom: 10 }}>• {t('featVis1')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featVis2')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featVis3')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featVis4')}</li>
              </ul>
            </div>

            <div className="m_card" style={{ background: 'var(--m-surface)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{t('featDiagTitle')}</h3>
              <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', marginBottom: 16 }}>{t('featDiagSub')}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--m-text-secondary)' }}>
                <li style={{ marginBottom: 10 }}>• {t('featDiag1')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featDiag2')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featDiag3')}</li>
                <li style={{ marginBottom: 10 }}>• {t('featDiag4')}</li>
              </ul>
            </div>
          </div>

          <div style={{ background: 'var(--m-surface)', border: '1px solid var(--m-border)', borderRadius: 12, padding: 24, marginTop: 40 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>{t('featFlowTitle')}</h3>
            <div className="m_grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <strong style={{ color: 'var(--m-primary)', fontSize: 15 }}>{t('featFlow1Title')}</strong>
                <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', marginTop: 8 }}>
                  {t('featFlow1Desc')}
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--m-accent)', fontSize: 15 }}>{t('featFlow2Title')}</strong>
                <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', marginTop: 8 }}>
                  {t('featFlow2Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* END TO END DIAGRAM AND JOURNEY */}
      <section className="m_sectionAlt" style={{ padding: '80px 20px', background: 'radial-gradient(ellipse at center, var(--m-bg2) 0%, var(--m-bg) 100%)' }}>
        <div className="m_container">
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 20 }}>{t('featArchTitle')}</h2>
          <p style={{ textAlign: 'center', color: 'var(--m-text-secondary)', marginBottom: 60, maxWidth: 600, margin: '0 auto 60px' }}>
            {t('featArchSub')}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
            
            {/* The Diagram */}
            <div style={{ 
              width: '100%', 
              margin: '0 auto', 
              position: 'relative'
            }}>
              <img 
                src="/zerobanner-architecture-v2.png" 
                alt="ZeroBanner Architecture diagram" 
                style={{ 
                  width: '100%', 
                  maxHeight: 600, 
                  objectFit: 'contain', 
                  display: 'block', 
                  margin: '0 auto',
                  mixBlendMode: 'screen',
                  WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 60%, transparent 100%)',
                  maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 60%, transparent 100%)'
                }} 
              />
            </div>

            {/* The 9 Steps */}
            <div className="m_grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
              {[
                { title: t('featArch1T'), desc: t('featArch1D') },
                { title: t('featArch2T'), desc: t('featArch2D') },
                { title: t('featArch3T'), desc: t('featArch3D') },
                { title: t('featArch4T'), desc: t('featArch4D') },
                { title: t('featArch5T'), desc: t('featArch5D') },
                { title: t('featArch6T'), desc: t('featArch6D') },
                { title: t('featArch7T'), desc: t('featArch7D') },
                { title: t('featArch8T'), desc: t('featArch8D') },
                { title: t('featArch9T'), desc: t('featArch9D') }
              ].map((step, i) => (
                <div key={i} className="m_card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -20, right: -10, fontSize: 80, fontWeight: 900, color: 'var(--m-primary)', opacity: 0.05, lineHeight: 1 }}>
                    {i + 1}
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: 'var(--m-text)' }}>{step.title}</h4>
                  <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
