import numpy as np

from src.weights import ModelWeights
from src.model_merge import merge_weights_json


def test_merge_weights_json_weighted_average():
    local = ModelWeights.from_numpy([np.array([[1.0]], dtype=np.float32)]).model_dump_json()
    remote = ModelWeights.from_numpy([np.array([[3.0]], dtype=np.float32)]).model_dump_json()

    merged = merge_weights_json(local_json=local, global_json=remote, local_weight=0.75)
    out = ModelWeights.model_validate_json(merged).to_numpy()[0]

    assert float(out[0][0]) == 1.0 * 0.75 + 3.0 * 0.25
