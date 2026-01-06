import Link from 'next/link';
import { Shell } from '../components/Shell';

export default function SetupPage() {
  return (
    <Shell active="setup">
      <div className="topbar">
        <div>
          <div className="h1">Setup</div>
          <div className="sub">Getting started checklist for a professional demo deployment.</div>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 7' }}>
          <h3>1) Create account</h3>
          <div className="sub">
            <ul>
              <li>
                Sign up: <Link href="/signup">/signup</Link>
              </li>
              <li>
                Login: <Link href="/login">/login</Link>
              </li>
            </ul>
          </div>

          <hr className="hr" />

          <h3>2) Create a project + API key</h3>
          <div className="sub">
            <ul>
              <li>
                Projects: <Link href="/app/projects">/app/projects</Link>
              </li>
              <li>
                Keys: <Link href="/app/keys">/app/keys</Link>
              </li>
            </ul>
          </div>

          <hr className="hr" />

          <h3>3) Verify data + run the demo</h3>
          <div className="sub">
            <ul>
              <li>
                Overview: <Link href="/app/overview">/app/overview</Link>
              </li>
              <li>
                Recommendations: <Link href="/app/recommendations">/app/recommendations</Link>
              </li>
              <li>
                UX Auditor (chat): <Link href="/app/auditor">/app/auditor</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 5' }}>
          <h3>Germany compliance defaults</h3>
          <div className="sub">
            <ul>
              <li>No cookies / localStorage for tracking</li>
              <li>No raw events stored server-side</li>
              <li>Aggregated metrics only</li>
              <li>Project-level chat history (no PII)</li>
              <li>Designed for Legitimate Interest (GDPR Art. 6(1)(f))</li>
            </ul>
          </div>

          <hr className="hr" />

          <h3>Optional: Qdrant + DeepSeek</h3>
          <div className="sub">
            <div style={{ marginBottom: 8 }}>
              If running via Docker Compose, Qdrant UI is typically available at <code>http://localhost:6333/dashboard</code>.
            </div>
            <div>
              DeepSeek integration is configured via env vars and used by the UX Auditor to generate narrative answers over
              privacy-safe evidence.
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 12' }}>
          <h3>SDK snippet (example)</h3>
          <pre className="code">{`import ZeroBanner from '@privacyedge/analytics';

const analytics = new ZeroBanner({
  apiKey: 'YOUR_PROJECT_API_KEY',
  // Browser connects to the exposed API port
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  privacyLevel: 'high'
});

await analytics.init();
`}</pre>
        </div>
      </div>
    </Shell>
  );
}
