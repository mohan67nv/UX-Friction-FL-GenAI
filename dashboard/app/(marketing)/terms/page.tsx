import { getT } from '../../i18n/server';

export default async function TermsPage() {
  const t = await getT();
  
  return (
    <main className="m_section">
      <div className="m_container" style={{ maxWidth: 800 }}>
        <h1 className="m_h2">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <div style={{ marginTop: 10, color: 'var(--m-muted)', fontSize: 14 }}>
          Stand: 1. Januar 2026
        </div>
        
        <div style={{ marginTop: 30, display: 'grid', gap: 30 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>1. Geltungsbereich</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über die Nutzung der 
              ZeroBanner-Software (nachfolgend „Software“ oder „Dienst“) zwischen der ZeroBanner GmbH 
              (nachfolgend „Anbieter“) und dem Kunden.</p>
              <p>Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Kunden werden 
              nicht Vertragsbestandteil, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>2. Vertragsgegenstand</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Der Anbieter stellt dem Kunden eine cloudbasierte Software zur Analyse des Nutzerverhaltens auf 
              Websites zur Verfügung. Die Software arbeitet nach dem Prinzip des Federated Learning und Privacy by Design.</p>
              
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Leistungsumfang:</h3>
              <ul style={{ paddingLeft: 24, marginTop: 12 }}>
                <li>Bereitstellung der ZeroBanner-Software als SaaS (Software as a Service)</li>
                <li>Client-SDK zur Integration auf der Website des Kunden</li>
                <li>Dashboard zur Auswertung der Analysedaten</li>
                <li>KI-gestützte Empfehlungen zur UX-Optimierung</li>
                <li>API-Zugang (je nach gewähltem Tarif)</li>
                <li>Support (je nach gewähltem Tarif)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>3. Vertragsschluss</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Der Vertragsschluss erfolgt durch Registrierung auf der Website www.zerobanner.de und 
              Auswahl eines Tarifmodells. Mit der Registrierung gibt der Kunde ein verbindliches Angebot zum 
              Abschluss eines Nutzungsvertrags ab.</p>
              <p>Der Anbieter nimmt das Angebot durch Freischaltung des Kundenkontos an. Der Vertrag kommt mit 
              der Freischaltung zustande.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>4. Preise und Zahlungsbedingungen</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Es gelten die zum Zeitpunkt der Bestellung auf der Website angegebenen Preise. Alle Preise 
              verstehen sich zzgl. der gesetzlichen Umsatzsteuer.</p>
              <p>Die Abrechnung erfolgt monatlich im Voraus. Die Zahlung erfolgt per Lastschrift, Kreditkarte 
              oder Überweisung, je nach gewählter Zahlungsmethode.</p>
              <p>Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zur Software zu sperren.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>5. Vertragslaufzeit und Kündigung</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Der Vertrag wird auf unbestimmte Zeit geschlossen und kann von beiden Parteien mit einer Frist 
              von 30 Tagen zum Monatsende gekündigt werden.</p>
              <p>Die Kündigung muss in Textform (z.B. per E-Mail) erfolgen.</p>
              <p>Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>6. Verfügbarkeit</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Der Anbieter bemüht sich um eine möglichst hohe Verfügbarkeit der Software. Eine Verfügbarkeit 
              von 99,5% im Jahresmittel wird angestrebt.</p>
              <p>Wartungsarbeiten werden in der Regel außerhalb der üblichen Geschäftszeiten durchgeführt und 
              rechtzeitig angekündigt.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>7. Datenschutz und Datensicherheit</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Der Anbieter verarbeitet personenbezogene Daten des Kunden ausschließlich im Rahmen der 
              Datenschutzerklärung und der gesetzlichen Bestimmungen, insbesondere der DSGVO.</p>
              <p>Die ZeroBanner-Software arbeitet nach dem Prinzip „Privacy by Design“:</p>
              <ul style={{ paddingLeft: 24, marginTop: 12 }}>
                <li>Keine Speicherung von personenbezogenen Daten der Website-Besucher</li>
                <li>Keine IP-Adressen, keine Cookies, keine Session-IDs</li>
                <li>Federated Learning: Nur aggregierte Modelle werden übertragen</li>
                <li>Alle Daten werden in Deutschland (EU) gespeichert</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>8. Haftung</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder 
              der Gesundheit, die auf einer vorsätzlichen oder fahrlässigen Pflichtverletzung beruhen.</p>
              <p>Im Übrigen haftet der Anbieter nur bei Vorsatz und grober Fahrlässigkeit.</p>
              <p>Die Haftung für mittelbare Schäden und Folgeschäden ist ausgeschlossen.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>9. Schlussbestimmungen</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</p>
              <p>Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist Berlin, sofern der Kunde Kaufmann, 
              juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.</p>
              <p>Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der 
              übrigen Bestimmungen hiervon unberührt.</p>
            </div>
          </section>

          <section style={{ marginTop: 40, paddingTop: 30, borderTop: '1px solid var(--m-border)' }}>
            <div style={{ color: 'var(--m-muted)', fontSize: 14 }}>
              <p>Bei Fragen zu unseren AGB kontaktieren Sie uns bitte unter:</p>
              <p style={{ marginTop: 8 }}>
                <a href="mailto:legal@zerobanner.de" style={{ color: 'var(--m-primary)' }}>legal@zerobanner.de</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
