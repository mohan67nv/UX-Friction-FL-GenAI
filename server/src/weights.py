from __future__ import annotations

from typing import Optional

import numpy as np
from pydantic import BaseModel


class Tensor(BaseModel):
    shape: list[int]
    data: list[float]

    def to_numpy(self) -> np.ndarray:
        arr = np.array(self.data, dtype=np.float32)
        return arr.reshape(self.shape)


class ModelWeights(BaseModel):
    tensors: Optional[list[Tensor]] = None
    layers: Optional[list[list[list[float]]]] = None

    def to_numpy(self) -> list[np.ndarray]:
        if self.tensors is not None:
            return [t.to_numpy() for t in self.tensors]
        if self.layers is not None:
            return [np.array(layer, dtype=np.float32) for layer in self.layers]
        return []

    @classmethod
    def from_numpy(cls, arrays: list[np.ndarray]) -> "ModelWeights":
        return cls(tensors=[Tensor(shape=list(a.shape), data=a.astype(np.float32).ravel().tolist()) for a in arrays])
