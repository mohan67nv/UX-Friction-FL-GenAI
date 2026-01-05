from __future__ import annotations

import os
from dataclasses import dataclass

from .embeddings import embed_text
from .vector_store import VectorDoc, get_vector_store


@dataclass(frozen=True)
class IntentContext:
    title: str
    content: str
    source: str = "intent"


def retrieve_intent_contexts(*, project_id: str, query: str, top_k: int = 3) -> tuple[list[IntentContext], str]:
    """Retrieve privacy-safe context from stored intent embedding summaries.

    This searches the *intent embedding* vector index (Qdrant if configured; otherwise in-memory).

    Notes:
    - The stored docs are aggregated (e.g., mean vector per hour) and contain no PII.
    - We intentionally keep intent embeddings in a separate collection (`QDRANT_INTENT_COLLECTION`) to
      avoid dimension mismatch with text embedding collections.
    """

    # Query embedding is generated using our text embedding backend.
    # If its dimension doesn't match the stored intent embeddings, we can't do a proper vector search.
    query_emb, backend, dim = embed_text(query)

    collection = os.getenv("QDRANT_INTENT_COLLECTION", "intent_embeddings")
    store = get_vector_store(dim, collection=collection)

    try:
        hits: list[VectorDoc] = store.search(project_id=project_id, query_embedding=query_emb, limit=top_k)
    except Exception:
        # If Qdrant is configured with a different dim, or collection missing,
        # just return no intent contexts.
        return [], backend

    out: list[IntentContext] = []
    for h in hits:
        if h.source != "intent":
            # In case other doc types end up in the collection, ignore them.
            continue
        out.append(IntentContext(title=h.title, content=h.content, source=h.source))

    return out, backend
