from __future__ import annotations

import os
import time
from dataclasses import dataclass

import numpy as np

from .weights import ModelWeights


@dataclass
class RateLimit:
    limit_per_minute: int


class InMemoryRateLimiter:
    def __init__(self, limit_per_minute: int) -> None:
        self.limit = limit_per_minute
        self.buckets: dict[str, tuple[int, int]] = {}  # key -> (minute, count)

    def allow(self, key: str) -> bool:
        minute = int(time.time() // 60)
        last_minute, count = self.buckets.get(key, (minute, 0))
        if last_minute != minute:
            last_minute, count = minute, 0
        count += 1
        self.buckets[key] = (last_minute, count)
        return count <= self.limit


def check_weights_sane(weights_json: str) -> None:
    """Basic poisoning heuristics.

    Rejects:
    - too many tensors
    - extremely large tensor arrays
    - excessively large L2 norm (likely poison)

    These are coarse defenses; in production we can add robust aggregation.
    """

    max_tensors = int(os.getenv("GLOBAL_SYNC_MAX_TENSORS", "64"))
    max_params = int(os.getenv("GLOBAL_SYNC_MAX_PARAMS", "5_000_000"))
    max_l2 = float(os.getenv("GLOBAL_SYNC_MAX_L2_NORM", "1e6"))

    mw = ModelWeights.model_validate_json(weights_json)
    arrays = mw.to_numpy()

    if len(arrays) > max_tensors:
        raise ValueError("too many tensors")

    total_params = 0
    squared = 0.0
    for a in arrays:
        total_params += int(a.size)
        squared += float(np.sum(np.square(a.astype(np.float64))))

    if total_params > max_params:
        raise ValueError("too many parameters")

    l2 = float(np.sqrt(squared))
    if l2 > max_l2:
        raise ValueError("update norm too large")
