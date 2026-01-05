from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Any, Iterable

import numpy as np


@dataclass(frozen=True)
class VectorDoc:
    id: str
    project_id: str
    title: str
    content: str
    source: str
    embedding: list[float]
    updated_at: float


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


class InMemoryVectorStore:
    def __init__(self) -> None:
        self._docs: dict[str, VectorDoc] = {}

    def upsert(self, docs: Iterable[VectorDoc]) -> None:
        for d in docs:
            self._docs[d.id] = d

    def search(self, *, project_id: str, query_embedding: list[float], limit: int = 5) -> list[VectorDoc]:
        q = np.asarray(query_embedding, dtype=np.float32)
        scored: list[tuple[float, VectorDoc]] = []
        for d in self._docs.values():
            if d.project_id != project_id:
                continue
            s = _cosine(q, np.asarray(d.embedding, dtype=np.float32))
            scored.append((s, d))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [d for s, d in scored[:limit] if s > 0.0]


class QdrantVectorStore:
    def __init__(self, url: str, collection: str, dim: int) -> None:
        from qdrant_client import QdrantClient
        from qdrant_client.http import models as qm

        self.client = QdrantClient(url=url)
        self.collection = collection
        self.dim = dim

        # Create collection if missing (do NOT drop existing data).
        try:
            existing = {c.name for c in self.client.get_collections().collections}
        except Exception:
            existing = set()

        if self.collection not in existing:
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=qm.VectorParams(size=dim, distance=qm.Distance.COSINE),
            )
        else:
            # Best-effort sanity check: if size mismatches, create a new collection name.
            try:
                info = self.client.get_collection(self.collection)
                size = getattr(getattr(info, "config", None), "params", None)
                existing_dim = getattr(getattr(size, "vectors", None), "size", None)
                if isinstance(existing_dim, int) and existing_dim != dim:
                    raise RuntimeError(
                        f"Qdrant collection '{self.collection}' dim mismatch: existing={existing_dim} expected={dim}"
                    )
            except Exception:
                # Leave as-is; errors will surface during search/upsert.
                pass

    def upsert(self, docs: Iterable[VectorDoc]) -> None:
        from qdrant_client.http import models as qm

        points = []
        for d in docs:
            points.append(
                qm.PointStruct(
                    id=d.id,
                    vector=d.embedding,
                    payload={
                        "project_id": d.project_id,
                        "title": d.title,
                        "content": d.content,
                        "source": d.source,
                        "updated_at": d.updated_at,
                    },
                )
            )
        if points:
            self.client.upsert(collection_name=self.collection, points=points)

    def search(self, *, project_id: str, query_embedding: list[float], limit: int = 5) -> list[VectorDoc]:
        from qdrant_client.http import models as qm

        res = self.client.search(
            collection_name=self.collection,
            query_vector=query_embedding,
            limit=limit,
            query_filter=qm.Filter(
                must=[qm.FieldCondition(key="project_id", match=qm.MatchValue(value=project_id))]
            ),
        )
        out: list[VectorDoc] = []
        for p in res:
            payload: dict[str, Any] = p.payload or {}
            out.append(
                VectorDoc(
                    id=str(p.id),
                    project_id=str(payload.get("project_id", "")),
                    title=str(payload.get("title", "")),
                    content=str(payload.get("content", "")),
                    source=str(payload.get("source", "")),
                    embedding=list(map(float, p.vector)) if isinstance(p.vector, list) else list(query_embedding),
                    updated_at=float(payload.get("updated_at", 0.0)),
                )
            )
        return out


# One store per (collection, dim)
_store_singletons: dict[tuple[str, int], Any] = {}


def get_vector_store(dim: int, *, collection: str | None = None) -> Any:
    """Return a vector store.

    Selection:
    - If QDRANT_URL is set -> Qdrant
    - Else -> in-memory store (good for tests)

    Notes:
    - singleton per (collection, dim) to avoid repeated collection checks.
    - `collection` defaults to env `QDRANT_COLLECTION`.
    """

    url = os.getenv("QDRANT_URL", "").strip()
    collection = (collection or os.getenv("QDRANT_COLLECTION", "friction_insights")).strip()

    key = (collection, int(dim))

    if url:
        store = _store_singletons.get(key)
        if not isinstance(store, QdrantVectorStore):
            store = QdrantVectorStore(url=url, collection=collection, dim=dim)
            _store_singletons[key] = store
        return store

    store = _store_singletons.get(key)
    if store is None or not isinstance(store, InMemoryVectorStore):
        store = InMemoryVectorStore()
        _store_singletons[key] = store
    return store


def now_ts() -> float:
    return time.time()
