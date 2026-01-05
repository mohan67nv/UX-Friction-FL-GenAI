from __future__ import annotations

import hashlib

import os

from .vector_store import VectorDoc, get_vector_store, now_ts


def index_intent_embedding(
    *,
    project_id: str,
    ts_ms: int,
    embedding: list[float],
    source: str = "intent",
    title: str | None = None,
    content: str | None = None,
) -> None:
    """Index an aggregated intent embedding into the vector store.

    Privacy:
    - Only aggregated vectors are stored (e.g., batch mean), no PII.
    """

    if not embedding:
        return

    dim = len(embedding)

    # Keep intent embeddings in a separate collection to avoid dim mismatches
    # with text-embedding docs used by the UX auditor.
    collection = os.getenv("QDRANT_INTENT_COLLECTION", "intent_embeddings")
    store = get_vector_store(dim, collection=collection)

    # deterministic id per hour bucket + project
    hour = int(ts_ms // 3_600_000)
    vid = hashlib.sha256(f"{project_id}:{source}:{hour}".encode("utf-8")).hexdigest()

    doc = VectorDoc(
        id=vid,
        project_id=project_id,
        title=title or f"Intent embedding hour={hour}",
        content=content or "Aggregated on-device intent embedding summary (mean vector).",
        source=source,
        embedding=embedding,
        updated_at=now_ts(),
    )
    store.upsert([doc])
