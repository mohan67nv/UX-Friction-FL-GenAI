'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { runChatAction } from './chatActions';

type Project = { id: string; name: string };

type Evidence = { title: string; content: string; source: string };
type Action = { action?: string | null; label: string; description: string };

type AskResponse = {
  answer: string;
  evidence: Evidence[];
  actions: Action[];
  confidence: number;
  model: string;
};

type Msg = {
  role: 'user' | 'assistant';
  content: string;
  meta?: { model?: string; confidence?: number };
  actions?: Action[];
};

export default function AuditorPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [lang, setLang] = useState<'de' | 'en'>('de');

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        lang === 'de'
          ? 'Frag mich: „Warum verlassen Nutzer den Checkout?“ oder „Zeig mir Safari-Probleme“.\n\nIch nutze nur aggregierte Daten (keine PII, kein Session Replay).'
          : 'Ask me: "Why are users abandoning checkout?" or "Show me Safari issues".\n\nI only use aggregated data (no PII, no session replay).'
    }
  ]);

  // Load persisted history when project changes
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const res = await fetch(`/api/dashboard/ux-auditor/history?project_id=${encodeURIComponent(projectId)}&limit=50`);
      if (!res.ok) return;
      const data = (await res.json()) as { items: { role: 'user' | 'assistant'; content: string; model?: string; confidence?: number }[] };
      if (!data.items?.length) return;
      setMessages((prev) => {
        // Keep the first system assistant hint, then append history
        const first = prev[0];
        const hist = data.items.map(
          (m) => ({ role: m.role, content: m.content, meta: { model: m.model, confidence: m.confidence } } as Msg)
        );
        return first ? [first, ...hist] : hist;
      });
    })();
  }, [projectId]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/dashboard/projects');
      const list = (await res.json()) as Project[];
      setProjects(list);
      if (!projectId && list.length) setProjectId(list[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update initial message when language changes.
  useEffect(() => {
    setMessages((prev) => {
      const first = prev[0];
      if (!first || first.role !== 'assistant') return prev;
      const nextFirst: Msg = {
        role: 'assistant',
        content:
          lang === 'de'
            ? 'Frag mich: „Warum verlassen Nutzer den Checkout?“ oder „Zeig mir Safari-Probleme“.\n\nIch nutze nur aggregierte Daten (keine PII, kein Session Replay).'
            : 'Ask me: "Why are users abandoning checkout?" or "Show me Safari issues".\n\nI only use aggregated data (no PII, no session replay).'
      };
      return [nextFirst, ...prev.slice(1)];
    });
  }, [lang]);

  const canAsk = useMemo(() => !!projectId && question.trim().length >= 3 && !loading, [projectId, question, loading]);

  async function ask() {
    if (!canAsk) return;
    const q = question.trim();
    setQuestion('');

    setMessages((m) => [...m, { role: 'user', content: q }]);

    // Persist user message (project-level, no PII beyond what user typed)
    void fetch('/api/dashboard/ux-auditor/append', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, role: 'user', content: q })
    }).catch(() => void 0);

    setLoading(true);

    try {
      const res = await fetch('/api/dashboard/ux-auditor/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, question: q, time_range: timeRange, lang })
      });
      const data = (await res.json()) as AskResponse;
      if (!res.ok) {
        throw new Error((data as any).detail || 'Request failed');
      }

      const meta = { model: data.model, confidence: data.confidence };
      const answer = `${data.answer}`;

      // Append evidence + actions in a compact way
      const extraParts: string[] = [];
      if (data.evidence?.length) {
        extraParts.push(
          (lang === 'de' ? '\n\nEvidenz:' : '\n\nEvidence:') +
            '\n' +
            data.evidence
              .slice(0, 5)
              .map((e) => `- ${e.title} (${e.source})`)
              .join('\n')
        );
      }
      if (data.actions?.length) {
        extraParts.push(
          (lang === 'de' ? '\n\nNächste Schritte:' : '\n\nNext actions:') +
            '\n' +
            data.actions
              .slice(0, 5)
              .map((a) => `- ${a.label}: ${a.description}`)
              .join('\n')
        );
      }

      const assistantMsg: Msg = { role: 'assistant', content: answer + extraParts.join(''), meta };
      // attach raw actions as meta for rendering buttons
      (assistantMsg as any).actions = data.actions;
      setMessages((m) => [...m, assistantMsg]);

      // Persist assistant message
      void fetch('/api/dashboard/ux-auditor/append', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          role: 'assistant',
          content: assistantMsg.content,
          model: data.model,
          confidence: data.confidence
        })
      }).catch(() => void 0);

    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: lang === 'de' ? `Fehler: ${String(e?.message || e)}` : `Error: ${String(e?.message || e)}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="h1">PrivaLytics AI Auditor</div>
          <div className="sub">
            {lang === 'de'
              ? 'Konversationelle UX-Analyse aus aggregierten Daten (privacy-first).'
              : 'Conversational UX analysis from aggregated data (privacy-first).'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btnSecondary" href="/app/overview">
            Overview
          </Link>
          <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} style={{ width: 260 }}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select className="input" value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={{ width: 110 }}>
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
          <select className="input" value={lang} onChange={(e) => setLang(e.target.value as 'de' | 'en')} style={{ width: 90 }}>
            <option value="de">DE</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflow: 'auto' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: 12,
                  background: m.role === 'user' ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.18)'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.content}</div>
                {m.meta?.model ? (
                  <div className="sub" style={{ marginTop: 8 }}>
                    model: {m.meta.model}
                    {typeof m.meta.confidence === 'number' ? ` · conf: ${Math.round(m.meta.confidence * 100)}%` : ''}
                  </div>
                ) : null}

                {m.role === 'assistant' && m.actions?.length ? (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {m.actions.map((a, i) => (
                      <button
                        key={i}
                        className="btn btnSecondary"
                        onClick={async () => {
                          if (!projectId) return;

                          const appendAssistantMessage = async (content: string) => {
                            const msg: Msg = { role: 'assistant', content };
                            setMessages((prev) => [...prev, msg]);
                            // Persist action output as assistant message.
                            void fetch('/api/dashboard/ux-auditor/append', {
                              method: 'POST',
                              headers: { 'content-type': 'application/json' },
                              body: JSON.stringify({ project_id: projectId, role: 'assistant', content })
                            }).catch(() => void 0);
                          };

                          try {
                            await runChatAction(a, { projectId, lang, setTimeRange, appendAssistantMessage });
                          } catch {
                            await appendAssistantMessage(lang === 'de' ? 'Aktion fehlgeschlagen.' : 'Action failed.');
                          }
                        }}
                        title={a.description}
                      >
                        {a.label || a.description}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? <div className="sub">{lang === 'de' ? 'Denke…' : 'Thinking…'}</div> : null}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={lang === 'de' ? 'Frage stellen…' : 'Ask a question…'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') ask();
              }}
            />
            <button className="btn" disabled={!canAsk} onClick={ask}>
              {lang === 'de' ? 'Fragen' : 'Ask'}
            </button>
          </div>
          <div className="sub">
            {lang === 'de'
              ? 'Hinweis: Es werden nur aggregierte Kennzahlen und Empfehlungen verwendet. Keine Cookies, keine Session-Replays.'
              : 'Note: Uses only aggregated metrics and recommendations. No cookies, no session replay.'}
          </div>
        </div>
      </div>
    </>
  );
}
