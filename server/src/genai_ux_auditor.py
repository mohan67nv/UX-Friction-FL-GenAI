from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from . import crud
from .crud_cohorts import query_cohort_breakdown
from .embeddings import embed_text
from .llm_backends import generate as llm_generate
from .genai_orchestrator import enabled as orchestrator_enabled, rag_answer
from .models_recommendations import Recommendation
from .vector_store import VectorDoc, get_vector_store, now_ts
from .intent_retrieval import retrieve_intent_contexts


@dataclass(frozen=True)
class Doc:
    title: str
    content: str
    source: str


def _doc_id(project_id: str, source: str, title: str) -> str:
    h = hashlib.sha256(f"{project_id}:{source}:{title}".encode("utf-8")).hexdigest()
    return h


def _to_vector_docs(project_id: str, docs: list[Doc]) -> list[VectorDoc]:
    out: list[VectorDoc] = []
    ts = now_ts()
    for d in docs:
        emb, _backend, dim = embed_text(d.title + "\n" + d.content)
        out.append(
            VectorDoc(
                id=_doc_id(project_id, d.source, d.title),
                project_id=project_id,
                title=d.title,
                content=d.content,
                source=d.source,
                embedding=emb,
                updated_at=ts,
            )
        )
    return out


def semantic_retrieve(*, project_id: str, query: str, docs: list[Doc], top_k: int = 5) -> tuple[list[Doc], str]:
    # Index docs into vector store (Qdrant if configured; else in-memory)
    # Then retrieve semantically similar docs.
    query_emb, emb_backend, dim = embed_text(query)

    # Separate collection for UX-auditor textual docs.
    collection = os.getenv("QDRANT_TEXT_COLLECTION", "ux_auditor_docs")
    store = get_vector_store(dim, collection=collection)

    vdocs = _to_vector_docs(project_id, docs)
    store.upsert(vdocs)

    hits = store.search(project_id=project_id, query_embedding=query_emb, limit=top_k)

    # Convert back to Doc (keep exact content from payload)
    contexts = [Doc(title=h.title, content=h.content, source=h.source) for h in hits]
    return contexts, emb_backend


def _parse_time_range(s: str) -> int:
    # keep consistent with app.parse_time_range
    s = (s or "").strip().lower()
    if s.endswith("h"):
        return max(1, int(s[:-1]))
    if s.endswith("d"):
        return max(1, int(s[:-1]) * 24)
    return 24 * 7


async def build_project_docs(db: AsyncSession, project_id: str, time_range: str) -> list[Doc]:
    hours = _parse_time_range(time_range)
    series = await crud.query_timeseries(db, project_id, hours)

    counts: dict[str, int] = {}
    for p in series:
        counts[p["metric_type"]] = counts.get(p["metric_type"], 0) + int(p["count"])

    docs: list[Doc] = []

    # 1) Aggregated metrics document
    cohorts = await query_cohort_breakdown(db, project_id, hours)

    metrics_lines = [f"{k}: {v}" for k, v in sorted(counts.items(), key=lambda kv: kv[1], reverse=True)]
    cohort_lines = []
    if cohorts.get("device_type"):
        cohort_lines.append("device_type breakdown: " + ", ".join([f"{k}={v}" for k, v in sorted(cohorts["device_type"].items(), key=lambda kv: kv[1], reverse=True)]))
    if cohorts.get("browser_family"):
        cohort_lines.append(
            "browser_family breakdown: "
            + ", ".join([f"{k}={v}" for k, v in sorted(cohorts["browser_family"].items(), key=lambda kv: kv[1], reverse=True)])
        )

    docs.append(
        Doc(
            title=f"Friction metrics last {hours}h",
            content=("\n".join(metrics_lines + cohort_lines) if (metrics_lines or cohort_lines) else "No friction events recorded in selected range."),
            source="analytics",
        )
    )

    # 2) Top recommendations as documents
    rec_rows = await db.execute(
        select(Recommendation)
        .where(Recommendation.project_id == project_id)
        .order_by(Recommendation.impact_month_eur.desc())
        .limit(10)
    )
    for r in rec_rows.scalars().all():
        docs.append(
            Doc(
                title=r.title,
                content="\n".join(
                    [
                        f"Priority: {r.priority}",
                        f"Status: {r.status}",
                        f"Metric: {r.metric_type}",
                        f"What: {r.what_text}",
                        f"Why: {r.why_text}",
                        f"Who: {r.who_text}",
                        f"Fix summary: {r.fix_summary}",
                        f"Fix code: {r.fix_code}",
                        f"Confidence: {r.confidence}",
                        f"Incidents/week: {r.incidents_week}",
                        f"Impact/month EUR: {r.impact_month_eur}",
                    ]
                ),
                source="recommendations",
            )
        )

    # 3) A tiny "benchmarks" doc (currently simulated in endpoint)
    docs.append(
        Doc(
            title="Benchmarks (demo)",
            content=(
                "Benchmarks are currently simulated for demo until sufficient anonymous network data exists. "
                "Germany-first: comparisons will be DACH / DE e-commerce by category."
            ),
            source="benchmarks",
        )
    )

    return docs


def _heuristic_answer(question: str, contexts: list[Doc], lang: str) -> str:
    # Deterministic answer when no LLM configured.
    # Keep it short, actionable, and strictly based on available context.
    if lang == "en":
        header = "AI UX Auditor (heuristic mode)"
        if not contexts:
            return (
                f"{header}: I don't yet have enough aggregated evidence for this question. "
                "Try expanding the time range or generating recommendations first."
            )
        bullets = "\n".join([f"- {c.title} ({c.source})" for c in contexts])
        return (
            f"{header}: Based on the aggregated data I found the following relevant evidence:\n{bullets}\n\n"
            "Next steps:\n"
            "- Check the top recommendation(s) matching your question\n"
            "- Filter by device/browser in future releases (planned)\n"
            "- If you set OPENAI_API_KEY, I can generate a richer narrative answer"
        )

    header = "AI UX Auditor (Heuristik-Modus)"
    if not contexts:
        return (
            f"{header}: Ich habe noch nicht genügend aggregierte Evidenz für diese Frage. "
            "Bitte erweitere den Zeitraum oder generiere zuerst Empfehlungen."
        )
    bullets = "\n".join([f"- {c.title} ({c.source})" for c in contexts])
    return (
        f"{header}: Basierend auf den aggregierten Daten habe ich folgende relevante Evidenz gefunden:\n{bullets}\n\n"
        "Nächste Schritte:\n"
        "- Prüfe die Top-Empfehlungen, die zu deiner Frage passen\n"
        "- Device/Browser-Filter in zukünftigen Releases (geplant)\n"
        "- Wenn du OPENAI_API_KEY setzt, kann ich eine ausführlichere Antwort generieren"
    )


def _build_context_text(contexts: list[Doc]) -> str:
    return "\n\n".join([f"[{c.source}] {c.title}\n{c.content}" for c in contexts])


def _system_prompt(lang: str) -> str:
    system = (
        "You are PrivaLytics AI, a privacy-first UX analytics auditor. "
        "You MUST ONLY use the provided aggregated context; do not invent facts. "
        "Do not request or output PII, URLs, raw user identifiers, or session replay. "
        "If the evidence is insufficient, say so and propose what aggregated data would be needed. "
        "Always provide actionable next steps."
    )
    if lang == "de":
        return system + " Respond in German."
    return system + " Respond in English."


async def _llm_answer(*, question: str, contexts: list[Doc], lang: str) -> tuple[str, str]:
    context_text = _build_context_text(contexts)
    user = (
        f"Question:\n{question}\n\n"
        f"Aggregated context (privacy-safe):\n{context_text}\n\n"
        "Return a structured response with:\n"
        "1) Root cause hypothesis (short)\n"
        "2) Evidence bullets (3-6) referencing the context\n"
        "3) Recommended fix steps (3-5)\n"
        "4) Estimated impact if possible (use any EUR impact fields from context; otherwise state unknown)\n"
        "5) Confidence as a percentage (0-100) based on evidence strength\n"
    )

    res = await llm_generate(system=_system_prompt(lang), user=user)
    return res.text, f"{res.backend}:{res.model}"


@dataclass(frozen=True)
class AuditorResult:
    answer: str
    evidence: list[Doc]
    # (action_id, label, description)
    actions: list[tuple[str, str, str]]
    confidence: float
    model: str
    retrieval_backend: str


def _default_actions(lang: str) -> list[tuple[str, str, str]]:
    # Basic UI actions for the dashboard chat.
    # These are intentionally generic (no IDs), so they remain privacy-safe.
    if lang == "en":
        return [
            (
                "open_recommendations",
                "Open recommendations",
                "Jump to the recommendations page for this project.",
            ),
            (
                "mark_top_recommendation_done",
                "Mark top recommendation as done",
                "Mark the highest-impact open recommendation as done.",
            ),
            (
                "expand_time_range",
                "Expand time range",
                "Switch to 30d to increase evidence for this analysis.",
            ),
        ]

    return [
        (
            "open_recommendations",
            "Empfehlungen öffnen",
            "Zur Empfehlungen-Seite für dieses Projekt springen.",
        ),
        (
            "mark_top_recommendation_done",
            "Top-Empfehlung als erledigt markieren",
            "Die Open-Top-Empfehlung mit dem höchsten Impact als erledigt markieren.",
        ),
        (
            "expand_time_range",
            "Zeitraum erweitern",
            "Auf 30d wechseln, um mehr Evidenz zu erhalten.",
        ),
    ]


def _confidence_from_evidence(contexts: list[Doc]) -> float:
    # Simple evidence-based score (0..1)
    if not contexts:
        return 0.0

    base = min(1.0, 0.2 + 0.15 * len(contexts))

    # boost if recommendations exist
    if any(c.source == "recommendations" for c in contexts):
        base = min(1.0, base + 0.2)

    # small boost if intent evidence exists
    if any(c.source == "intent" for c in contexts):
        base = min(1.0, base + 0.1)

    return float(base)


async def answer_question(
    *,
    db: AsyncSession,
    project_id: str,
    question: str,
    time_range: str,
    lang: str,
    top_k: int = 5,
) -> AuditorResult:
    # Step 1: Build privacy-safe docs from aggregated sources.
    docs = await build_project_docs(db, project_id, time_range)

    # Step 2: Semantic retrieval (Qdrant if configured, else in-memory)
    contexts, retrieval_backend = semantic_retrieve(project_id=project_id, query=question, docs=docs, top_k=top_k)

    # Step 2b: Retrieve intent embedding contexts (if available).
    intent_contexts, intent_backend = retrieve_intent_contexts(project_id=project_id, query=question, top_k=3)
    if intent_contexts:
        for ic in intent_contexts:
            contexts.append(Doc(title=ic.title, content=ic.content, source=ic.source))
        retrieval_backend = f"{retrieval_backend}+intent:{intent_backend}"

    # Step 3: Analyze + respond
    actions = _default_actions(lang)
    confidence = _confidence_from_evidence(contexts)

    # Step 4: Generate narrative via LLM if available.
    if os.getenv("OPENAI_API_KEY") or os.getenv("OLLAMA_URL") or os.getenv("LLM_BACKEND"):
        # Optional: Haystack/LangChain orchestrator
        if orchestrator_enabled():
            try:
                r = await rag_answer(question=question, contexts=contexts, lang=lang)
                return AuditorResult(
                    answer=r.answer,
                    evidence=contexts,
                    actions=actions,
                    confidence=confidence,
                    model=r.model,
                    retrieval_backend=retrieval_backend,
                )
            except Exception:
                # fall back
                pass

        try:
            ans, model = await _llm_answer(question=question, contexts=contexts, lang=lang)
            return AuditorResult(
                answer=ans,
                evidence=contexts,
                actions=actions,
                confidence=confidence,
                model=model,
                retrieval_backend=retrieval_backend,
            )
        except Exception:
            pass

    return AuditorResult(
        answer=_heuristic_answer(question, contexts, lang),
        evidence=contexts,
        actions=actions,
        confidence=confidence,
        model="heuristic",
        retrieval_backend=retrieval_backend,
    )
