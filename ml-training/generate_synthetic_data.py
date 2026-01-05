"""Generate synthetic UX interaction patterns for foundation model training.

Germany-first privacy constraints:
- No raw URLs, no text, no identifiers.
- Feature vectors are numeric abstractions.

Outputs: ml-training/synthetic_ux_dataset.json
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

import numpy as np


@dataclass
class Sample:
    features: list[float]
    label: list[int]


class SyntheticUXGenerator:
    """Generates privacy-safe synthetic training samples."""

    def _as(self, features: list[float], label: list[int]) -> dict[str, Any]:
        return {"features": features, "label": label}

    def generate_rage_click(self, n: int) -> list[dict[str, Any]]:
        out = []
        for _ in range(n):
            out.append(
                self._as(
                    [
                        float(np.random.uniform(3, 10)),  # click_freq
                        0.0,  # element_type div
                        0.0,  # has_handler no
                        float(np.random.uniform(0.1, 0.3)),  # time_delta
                        float(np.random.uniform(0.5, 1.0)),  # cursor_velocity
                        float(np.random.uniform(0.7, 1.0)),  # same_element
                        float(np.random.uniform(0.0, 0.3)),  # scroll_depth
                        1.0,  # repeat_pattern
                    ],
                    [1, 0, 0, 0, 0],
                )
            )
        return out

    def generate_hesitation(self, n: int) -> list[dict[str, Any]]:
        out = []
        for _ in range(n):
            out.append(
                self._as(
                    [
                        0.0,
                        1.0,
                        1.0,
                        float(np.random.uniform(2.0, 8.0)),  # hover duration
                        float(np.random.uniform(0.0, 0.3)),
                        0.0,
                        float(np.random.uniform(0.5, 1.0)),
                        float(np.random.uniform(0.3, 0.7)),
                    ],
                    [0, 1, 0, 0, 0],
                )
            )
        return out

    def generate_confusion(self, n: int) -> list[dict[str, Any]]:
        out = []
        for _ in range(n):
            out.append(
                self._as(
                    [
                        float(np.random.uniform(0.5, 2.0)),
                        float(np.random.uniform(0.0, 1.0)),
                        1.0,
                        float(np.random.uniform(1.0, 3.0)),
                        float(np.random.uniform(0.3, 0.6)),
                        0.0,
                        float(np.random.uniform(0.3, 0.7)),
                        float(np.random.uniform(0.6, 1.0)),  # backtrack_ratio
                    ],
                    [0, 0, 1, 0, 0],
                )
            )
        return out

    def generate_satisfaction(self, n: int) -> list[dict[str, Any]]:
        out = []
        for _ in range(n):
            out.append(
                self._as(
                    [
                        float(np.random.uniform(0.2, 1.0)),
                        1.0,
                        1.0,
                        float(np.random.uniform(0.5, 1.5)),
                        float(np.random.uniform(0.5, 0.9)),
                        0.0,
                        float(np.random.uniform(0.8, 1.0)),
                        float(np.random.uniform(0.0, 0.2)),
                    ],
                    [0, 0, 0, 1, 0],
                )
            )
        return out

    def generate_neutral(self, n: int) -> list[dict[str, Any]]:
        out = []
        for _ in range(n):
            out.append(self._as(np.random.uniform(0, 1, size=8).tolist(), [0, 0, 0, 0, 1]))
        return out

    def generate_full_dataset(self, per_class: int = 5000) -> list[dict[str, Any]]:
        dataset: list[dict[str, Any]] = []
        dataset.extend(self.generate_rage_click(per_class))
        dataset.extend(self.generate_hesitation(per_class))
        dataset.extend(self.generate_confusion(per_class))
        dataset.extend(self.generate_satisfaction(per_class))
        dataset.extend(self.generate_neutral(per_class))
        np.random.shuffle(dataset)
        return dataset


def main() -> None:
    gen = SyntheticUXGenerator()
    dataset = gen.generate_full_dataset(per_class=2000)
    with open("ml-training/synthetic_ux_dataset.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f)
    print(f"Wrote {len(dataset)} samples to ml-training/synthetic_ux_dataset.json")


if __name__ == "__main__":
    main()
