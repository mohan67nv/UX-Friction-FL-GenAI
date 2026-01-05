'use client';

export type ChatAction = {
  action?: string | null;
  label: string;
  description: string;
};

export type ChatActionEnv = {
  projectId: string;
  lang: 'de' | 'en';
  setTimeRange: (v: string) => void;
  appendAssistantMessage: (content: string) => Promise<void>;
};

export async function runChatAction(a: ChatAction, env: ChatActionEnv): Promise<void> {
  const act = a.action || '';

  if (act === 'open_recommendations') {
    window.location.href = `/app/recommendations`;
    return;
  }

  if (act === 'expand_time_range') {
    env.setTimeRange('30d');
    await env.appendAssistantMessage(
      env.lang === 'de'
        ? '🕒 Zeitraum wurde auf 30d erweitert. Stelle die Frage erneut für mehr Evidenz.'
        : '🕒 Time range expanded to 30d. Ask again for more evidence.'
    );
    return;
  }

  if (act === 'mark_top_recommendation_done') {
    const top = await fetch(`/api/dashboard/recommendations/top?project_id=${encodeURIComponent(env.projectId)}`);
    if (!top.ok) {
      await env.appendAssistantMessage(env.lang === 'de' ? 'Keine offene Top-Empfehlung gefunden.' : 'No open top recommendation found.');
      return;
    }

    const rec = (await top.json()) as { id: string };
    const done = await fetch(`/api/dashboard/recommendations/${rec.id}/done`, { method: 'POST' });
    if (!done.ok) {
      await env.appendAssistantMessage(env.lang === 'de' ? 'Konnte Empfehlung nicht markieren.' : 'Could not mark recommendation.');
      return;
    }

    await env.appendAssistantMessage(
      env.lang === 'de' ? '✅ Top-Empfehlung wurde als erledigt markiert.' : '✅ Top recommendation marked as done.'
    );
    return;
  }

  await env.appendAssistantMessage(env.lang === 'de' ? 'Unbekannte Aktion.' : 'Unknown action.');
}
