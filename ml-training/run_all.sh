#!/usr/bin/env bash
set -euo pipefail

python -m pip install -r ml-training/requirements.txt
python ml-training/generate_synthetic_data.py
python ml-training/train_foundation_model.py

echo "Done. Artifacts: ml-training/foundation_model.onnx, ml-training/foundation_model.pt"
