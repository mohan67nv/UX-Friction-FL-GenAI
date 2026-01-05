from __future__ import annotations

import hashlib
import os
import re
from functools import lru_cache

import numpy as np


DEFAULT_DIM = int(os.getenv("EMBEDDINGS_DIM", "384"))


def _tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9äöüß]+", text.lower())


def _hash_vec(text: str, dim: int) -> list[float]:
    # Deterministic, fast embedding fallback (no external deps, no model download).
    # Not semantically strong, but supports tests and baseline retrieval.
    vec = np.zeros((dim,), dtype=np.float32)
    for tok in _tokens(text):
        h = hashlib.sha256(tok.encode("utf-8")).digest()
        # Use first 4 bytes as index seed.
        idx = int.from_bytes(h[:4], "big") % dim
        sign = 1.0 if (h[4] % 2 == 0) else -1.0
        vec[idx] += sign
    # Normalize
    n = float(np.linalg.norm(vec))
    if n > 0:
        vec /= n
    return vec.astype(np.float32).tolist()


@lru_cache(maxsize=1)
def _st_model():
    from sentence_transformers import SentenceTransformer

    name = os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    return SentenceTransformer(name)


def embed_text(text: str, *, dim: int | None = None) -> tuple[list[float], str, int]:
    """Return (embedding, backend_name, dim)."""

    dim = dim or DEFAULT_DIM
    backend = os.getenv("EMBEDDINGS_BACKEND", "hash").strip().lower()

    if backend in ("st", "sentence-transformers", "transformers"):
        try:
            model = _st_model()
            vec = model.encode([text], normalize_embeddings=True)[0]
            return list(map(float, vec)), "sentence-transformers", len(vec)
        except Exception:
            # fall back
            pass

    return _hash_vec(text, dim), "hash", dim
