#!/usr/bin/env bash
set -euo pipefail

VENV_DIR=${1:-ux-fl-venv}

python3 -m venv "$VENV_DIR"

# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"

python -m pip install --upgrade pip

# Core backend deps
pip install -r requirements.txt

echo "✅ venv ready: $VENV_DIR"
echo "Activate with: source $VENV_DIR/bin/activate"
