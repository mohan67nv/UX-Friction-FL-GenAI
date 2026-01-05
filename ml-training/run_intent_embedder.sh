#!/usr/bin/env bash
set -euo pipefail

python -m pip install -r ml-training/requirements.txt
python ml-training/generate_synthetic_data.py
python ml-training/train_intent_embedder.py

echo "Done. Artifacts: ml-training/intent_embedder.onnx (+ optional .int8.onnx)"
