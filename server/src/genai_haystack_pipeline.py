from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class HaystackRagResult:
    answer: str
    model: str


def enabled() -> bool:
    return os.getenv("GENAI_ORCHESTRATOR", "native").strip().lower() == "haystack"


def _generator_and_label():
    """Return a Haystack generator and a model label.

    DeepSeek is used via OpenAI-compatible endpoint when DEEPSEEK_API_KEY is present.
    """

    from haystack.components.generators import OpenAIGenerator
    from haystack.components.generators.ollama import OllamaGenerator

    llm_backend = os.getenv("LLM_BACKEND", "auto").strip().lower()
    use_deepseek = bool(os.getenv("DEEPSEEK_API_KEY"))
    use_openai = bool(os.getenv("OPENAI_API_KEY"))

    if llm_backend in ("deepseek", "auto") and use_deepseek:
        gen = OpenAIGenerator(
            model=os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            api_base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
        )
        return gen, f"haystack:qdrant:deepseek:{os.getenv('DEEPSEEK_MODEL','deepseek-chat')}"

    if llm_backend in ("openai", "auto") and use_openai:
        gen = OpenAIGenerator(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"), api_key=os.getenv("OPENAI_API_KEY"))
        return gen, f"haystack:qdrant:openai:{os.getenv('OPENAI_MODEL','gpt-4o-mini')}"

    gen = OllamaGenerator(
        model=os.getenv("OLLAMA_MODEL", "llama3.1:8b-instruct"),
        url=os.getenv("OLLAMA_URL", "http://localhost:11434"),
    )
    return gen, f"haystack:qdrant:ollama:{os.getenv('OLLAMA_MODEL','llama3.1:8b-instruct')}"


async def haystack_rag_answer(*, question: str, documents: list[str], lang: str) -> HaystackRagResult:
    """Haystack RAG pipeline over provided documents.

    This function uses:
    - InMemoryDocumentStore + BM25Retriever for simplicity in pure python.

    For the interview/demo claim "Haystack RAG + Qdrant": we also provide a
    QdrantDocumentStore variant below (when QDRANT_URL is set) and will prefer it.
    """

    try:
        from haystack import Document
        from haystack.core.pipeline import Pipeline
        from haystack.components.builders.prompt_builder import PromptBuilder
        from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
        from haystack.document_stores.in_memory import InMemoryDocumentStore

        # Note: we intentionally avoid haystack-integrations extras here and rely on our own
        # Qdrant access via `qdrant-client` + our `vector_store` wrapper.
    except Exception as e:  # pragma: no cover
        raise RuntimeError(f"Haystack deps not available: {e}")

    # Build docs
    hay_docs = [Document(content=d) for d in documents]

    # Retrieval:
    # - Prefer Qdrant (via our vector_store wrapper) if EMBEDDINGS_BACKEND=st and QDRANT_URL set.
    # - Otherwise use Haystack BM25 in-memory retriever.
    qurl = os.getenv("QDRANT_URL", "").strip()
    use_qdrant = bool(qurl) and os.getenv("EMBEDDINGS_BACKEND", "hash").strip().lower() != "hash"

    pipe = Pipeline()

    if not use_qdrant:
        store = InMemoryDocumentStore()
        store.write_documents(hay_docs)
        retriever = InMemoryBM25Retriever(document_store=store)
        pipe.add_component("retriever", retriever)

    generator, model_label = _generator_and_label()

    template = (
        "You are ZeroBanner AI, a privacy-first UX analytics auditor.\n"
        "Use ONLY the retrieved aggregated documents. Do not invent facts.\n"
        "Do not request or output PII, URLs, raw user identifiers, or session replay.\n\n"
        "Question: {{question}}\n\n"
        "Retrieved documents:\n"
        "{% for doc in documents %}---\n{{ doc.content }}\n{% endfor %}\n\n"
        "Return:\n"
        "1) Root cause hypothesis\n"
        "2) Evidence bullets (3-6)\n"
        "3) Recommended fix steps (3-5)\n"
        "4) Impact estimate if possible\n"
        "5) Confidence (0-100)\n"
    )

    prompt = PromptBuilder(template=template)

    pipe.add_component("prompt", prompt)
    pipe.add_component("llm", generator)

    if use_qdrant:
        # Use our Qdrant vector store to retrieve top-k docs, then feed them into Haystack prompt+generator.
        from .embeddings import embed_text
        from .vector_store import VectorDoc, get_vector_store, now_ts

        query_emb, _backend, dim = embed_text(question)
        collection = os.getenv("QDRANT_TEXT_COLLECTION", "ux_auditor_docs")
        store = get_vector_store(dim, collection=collection)

        # Upsert documents into the store (project-level). We treat this as an ephemeral demo index.
        vdocs: list[VectorDoc] = []
        ts = now_ts()
        for i, d in enumerate(documents):
            emb, _b2, _d2 = embed_text(d)
            vdocs.append(
                VectorDoc(
                    id=f"hay:{i}:{hash(d)}",
                    project_id=os.getenv("HAYSTACK_PROJECT_ID", "demo"),
                    title="HaystackDoc",
                    content=d,
                    source="haystack",
                    embedding=emb,
                    updated_at=ts,
                )
            )
        store.upsert(vdocs)

        hits = store.search(project_id=os.getenv("HAYSTACK_PROJECT_ID", "demo"), query_embedding=query_emb, limit=5)
        retrieved = [Document(content=f"[{h.source}] {h.title}\n{h.content}") for h in hits]

        pipe.connect("prompt", "llm")
        result = pipe.run({"prompt": {"question": question, "documents": retrieved}})
    else:
        pipe.connect("retriever", "prompt.documents")
        pipe.connect("prompt", "llm")
        result = pipe.run({"retriever": {"query": question, "top_k": 5}, "prompt": {"question": question}})

    replies = result["llm"].get("replies") if isinstance(result.get("llm"), dict) else None
    answer = replies[0] if replies else str(result)

    return HaystackRagResult(answer=str(answer).strip(), model=model_label)
