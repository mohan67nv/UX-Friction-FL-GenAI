import { getT } from '../../i18n/server';

export default async function PrivacyPage() {
  const t = await getT();
  
  return (
    <main className="m_section">
      <div className="m_container" style={{ maxWidth: 800 }}>
        <h1 className="m_h2">Datenschutzerklärung</h1>
        <div style={{ marginTop: 10, color: 'var(--m-muted)', fontSize: 14 }}>
          Stand: 1. Januar 2026
        </div>
        
        <div style={{ marginTop: 30, display: 'grid', gap: 30 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>1. Datenschutz auf einen Blick</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Allgemeine Hinweise</h3>
              <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
              passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
              persönlich identifiziert werden können.</p>
              
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Datenerfassung auf dieser Website</h3>
              <p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
              <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
              können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.</p>
              
              <p><strong>Wie erfassen wir Ihre Daten?</strong></p>
              <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um 
              Daten handeln, die Sie in ein Kontaktformular eingeben.</p>
              <p>Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere 
              IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit 
              des Seitenaufrufs).</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>2. Hosting</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter:</p>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Externes Hosting in Deutschland</h3>
              <p>Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, 
              werden auf den Servern des Hosters / der Hoster gespeichert. Hierbei kann es sich v.a. um IP-Adressen, 
              Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe und 
              sonstige Daten, die über eine Website generiert werden, handeln.</p>
              <p>Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und 
              bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten 
              Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).</p>
              <p><strong>Serverstandort: Deutschland (EU)</strong></p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>3. ZeroBanner Analytics (Unser Produkt)</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Diese Website nutzt ZeroBanner zur Analyse des Nutzerverhaltens. ZeroBanner arbeitet nach dem Prinzip 
              des Federated Learning und Privacy by Design:</p>
              <ul style={{ paddingLeft: 24, marginTop: 12 }}>
                <li>✅ Keine Cookies oder Local Storage</li>
                <li>✅ Keine IP-Adressen gespeichert</li>
                <li>✅ Keine Session-IDs oder Nutzer-Tracking</li>
                <li>✅ Nur aggregierte mathematische Modelle</li>
                <li>✅ Alle Daten verbleiben in Deutschland (EU)</li>
              </ul>
              <p style={{ marginTop: 12 }}><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse 
              an der Optimierung der Website-Usability ohne Datenschutzrisiko)</p>
              <p><strong>§ 25 TDDDG:</strong> ZeroBanner speichert keine Informationen auf Ihrem Endgerät und 
              erfordert daher keine Einwilligung gemäß § 25 TDDDG.</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>4. Allgemeine Hinweise und Pflichtinformationen</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Datenschutz</h3>
              <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre 
              personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie 
              dieser Datenschutzerklärung.</p>
              
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Hinweis zur verantwortlichen Stelle</h3>
              <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
              <p>ZeroBanner GmbH<br />
              Musterstraße 123<br />
              10115 Berlin<br />
              Deutschland<br /><br />
              E-Mail: <a href="mailto:privacy@zerobanner.de" style={{ color: 'var(--m-primary)' }}>privacy@zerobanner.de</a></p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>5. Ihre Rechte</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Sie haben folgende Rechte:</p>
              <ul style={{ paddingLeft: 24, marginTop: 12 }}>
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
                <li>Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>6. SSL- bzw. TLS-Verschlüsselung</h2>
            <div style={{ color: 'var(--m-text-secondary)', lineHeight: 1.8 }}>
              <p>Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine 
              SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile 
              des Browsers von „http://" auf „https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
