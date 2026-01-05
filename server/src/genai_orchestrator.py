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

    # Lazy imports so base install doesn't hard-crash.
    try:
        # Haystack v2
        from haystack import Document
        from haystack.components.builders.prompt_builder import PromptBuilder
        from haystack.components.generators import OpenAIGenerator
        from haystack.components.generators.ollama import OllamaGenerator
        from haystack.core.pipeline import Pipeline
    except Exception as e:  # pragma: no cover
        raise RuntimeError(f"Haystack not available: {e}")

    # Convert contexts into Haystack docs
    docs = [Document(content=f"[{c.source}] {c.title}\n{c.content}") for c in contexts]

    # Choose generator backend
    llm_backend = os.getenv("LLM_BACKEND", "auto").strip().lower()
    use_openai = bool(os.getenv("OPENAI_API_KEY"))

    generator = None
    model_label = "haystack"

    if llm_backend in ("openai", "auto") and use_openai:
        generator = OpenAIGenerator(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), api_key=os.getenv("OPENAI_API_KEY"))
        model_label = f"haystack:openai:{os.getenv('OPENAI_MODEL','gpt-4o-mini')}"
    else:
        generator = OllamaGenerator(model=os.getenv("OLLAMA_MODEL", "llama3.1:8b-instruct"), url=os.getenv("OLLAMA_URL", "http://localhost:11434"))
        model_label = f"haystack:ollama:{os.getenv('OLLAMA_MODEL','llama3.1:8b-instruct')}"

    template = (
        "You are PrivaLytics AI, a privacy-first UX analytics auditor.\n"
        "Use ONLY the provided aggregated documents. Do not invent facts.\n"
        "Do not request or output PII, URLs, raw user identifiers, or session replay.\n\n"
        "Question: {{question}}\n\n"
        "Aggregated documents:\n"
        "{% for doc in documents %}---\n{{ doc.content }}\n{% endfor %}\n\n"
        "Return:\n"
        "1) Root cause hypothesis\n"
        "2) Evidence bullets (3-6)\n"
        "3) Recommended fix steps (3-5)\n"
        "4) Impact estimate if possible\n"
        "5) Confidence (0-100)\n"
    )

    prompt = PromptBuilder(template=template)

    pipe = Pipeline()
    pipe.add_component("prompt", prompt)
    pipe.add_component("llm", generator)
    pipe.connect("prompt", "llm")

    result = pipe.run({"prompt": {"question": question, "documents": docs}})

    # Haystack generators return {"replies": ["..."]}
    replies = result["llm"].get("replies") if isinstance(result.get("llm"), dict) else None
    answer = replies[0] if replies else str(result)

    return OrchestratorResult(answer=str(answer).strip(), model=model_label)
