import { getT } from '../../i18n/server';

export default async function ImpressumPage() {
  const t = await getT();
  
  return (
    <main className="m_section">
      <div className="m_container" style={{ maxWidth: 800 }}>
        <h1 className="m_h2">Impressum</h1>
        
        <div style={{ marginTop: 30, display: 'grid', gap: 30 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Angaben gemäß § 5 TMG</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p><strong>ZeroBanner GmbH</strong></p>
              <p>Musterstraße 123<br />
              10115 Berlin<br />
              Deutschland</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Vertreten durch</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Geschäftsführer: Max Mustermann</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Kontakt</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Telefon: +49 (0) 30 1234567<br />
              E-Mail: <a href="mailto:info@zerobanner.de" style={{ color: 'var(--m-primary)' }}>info@zerobanner.de</a></p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Registereintrag</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Eintragung im Handelsregister<br />
              Registergericht: Amtsgericht Berlin-Charlottenburg<br />
              Registernummer: HRB 123456 B</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Umsatzsteuer-ID</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
              DE123456789</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Max Mustermann<br />
              Musterstraße 123<br />
              10115 Berlin</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>EU-Streitschlichtung</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--m-primary)' }}>
                https://ec.europa.eu/consumers/odr
              </a><br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Verbraucherstreitbeilegung</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
              Verbraucherschlichtungsstelle teilzunehmen.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
