from __future__ import annotations

import os
from dataclasses import dataclass

from typing import Protocol


class _DocLike(Protocol):
    title: str
    content: str
    source: str


@dataclass(frozen=True)
class OrchestratorResult:
    answer: str
    model: str


def enabled() -> bool:
    return os.getenv("GENAI_ORCHESTRATOR", "native").strip().lower() in ("haystack", "langchain", "rag")


async def rag_answer(*, question: str, contexts: list[_DocLike], lang: str) -> OrchestratorResult:
    """Optional RAG orchestrator.

    This is intentionally defensive:
    - If deps are missing or fail, callers should fall back to native pipeline.

    Implementation notes:
    - We use Haystack as the RAG pipeline framework.
    - We use LangChain only for future multi-agent flows (kept minimal here).
    """

    orch = os.getenv("GENAI_ORCHESTRATOR", "native").strip().lower()

    # LangChain orchestrator (multi-step)
    if orch == "langchain":
        from .genai_langchain import langchain_answer

        from .genai_ux_auditor import _build_context_text  # avoid duplication

        ctx = _build_context_text(list(contexts))
        r = await langchain_answer(question=question, context_text=ctx, lang=lang)
        return OrchestratorResult(answer=r.answer, model=r.model)

    # --- Haystack orchestrator (full pipeline)
    if orch == "haystack":
        from .genai_haystack_pipeline import haystack_rag_answer

        docs = [f"[{c.source}] {c.title}\n{c.content}" for c in contexts]
        r = await haystack_rag_answer(question=question, documents=docs, lang=lang)
        return OrchestratorResult(answer=r.answer, model=r.model)

    raise RuntimeError(f"Unknown GENAI_ORCHESTRATOR: {orch}")
