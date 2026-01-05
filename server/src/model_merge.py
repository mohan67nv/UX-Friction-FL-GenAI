from __future__ import annotations

import json
from typing import Any

import numpy as np

from .weights import ModelWeights


def _as_arrays(weights_json: str) -> list[np.ndarray]:
    mw = ModelWeights.model_validate_json(weights_json)
    return mw.to_numpy()


def merge_weights_json(
    *,
    local_json: str,
    global_json: str,
    local_weight: float = 0.7,
) -> str:
    """Weighted merge of two ModelWeights JSON blobs.

    Assumptions:
    - Both weights follow the same architecture (same tensor count + shapes)
    - If mismatched, falls back to local (safer for self-host).
    """

    if not (0.0 <= local_weight <= 1.0):
        raise ValueError("local_weight must be within [0,1]")

    try:
        local = _as_arrays(local_json)
        remote = _as_arrays(global_json)
    except Exception:
        return local_json

    if len(local) != len(remote):
        return local_json

    merged: list[np.ndarray] = []
    for a, b in zip(local, remote):
        if a.shape != b.shape:
            return local_json
        merged.append((a * local_weight + b * (1.0 - local_weight)).astype(np.float32))

    out = ModelWeights.from_numpy(merged)
    return out.model_dump_json()
