#!/bin/bash
# Quick training script without venv (uses system Python)

set -e
cd "$(dirname "$0")"

echo "🚀 Quick ML Model Training (No venv)"
echo "======================================"
echo ""

# Check if we need to install packages
echo "📦 Checking dependencies..."
python3 -c "import numpy, torch, onnx" 2>/dev/null || {
    echo ""
    echo "⚠️  Missing dependencies. Installing with pip..."
    echo "If this fails, you need to install:"
    echo "  sudo apt install python3-venv"
    echo "  OR use: python3 -m pip install --break-system-packages numpy torch onnx"
    echo ""
    exit 1
}

echo "✅ Dependencies found!"
echo ""

# Generate synthetic data
if [ ! -f "synthetic_ux_dataset.json" ] || [ ! -s "synthetic_ux_dataset.json" ]; then
    echo "📊 Generating synthetic training data..."
    python3 generate_synthetic_data.py
    echo "✅ Data generated: $(ls -lh synthetic_ux_dataset.json | awk '{print $5}')"
else
    echo "✅ Training data already exists: $(ls -lh synthetic_ux_dataset.json | awk '{print $5}')"
fi
echo ""

# Train foundation model
if [ ! -f "foundation_model.onnx" ]; then
    echo "🧠 Training foundation model..."
    echo "   (8-input neural network, ~2 minutes)"
    python3 train_foundation_model.py
    echo "✅ Foundation model trained!"
else
    echo "✅ Foundation model exists: $(ls -lh foundation_model.onnx | awk '{print $5}')"
fi
echo ""

# Train intent embedder
if [ ! -f "intent_embedder.onnx" ]; then
    echo "🤖 Training intent embedder (Transformer)..."
    echo "   (BERT-like model, ~2-3 minutes)"
    python3 train_intent_embedder.py
    echo "✅ Intent embedder trained!"
else
    echo "✅ Intent embedder exists: $(ls -lh intent_embedder.onnx | awk '{print $5}')"
fi
echo ""

echo "🎉 All models ready!"
echo ""
echo "📁 Generated files:"
ls -lh *.onnx *.pt 2>/dev/null || echo "   No files found"
echo ""
