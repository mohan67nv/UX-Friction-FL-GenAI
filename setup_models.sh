#!/bin/bash
# Quick setup script to generate ML models before sharing repo

set -e  # Exit on error

echo "🚀 Setting up ML models for PrivacyEdge/ZeroBanner"
echo "=================================================="

# Check if we're in the right directory
if [ ! -d "ml-training" ]; then
    echo "❌ Error: Please run this from the project root directory"
    exit 1
fi

cd ml-training

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found. Please install Python 3.11+"
    exit 1
fi

# Check if venv exists, create if not
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install requirements
echo "📥 Installing ML dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if data exists, generate if needed
if [ ! -f "synthetic_ux_dataset.json" ] || [ ! -s "synthetic_ux_dataset.json" ]; then
    echo "📊 Generating synthetic training data..."
    python generate_synthetic_data.py
else
    echo "✅ Synthetic training data already exists"
fi

# Train foundation model
if [ ! -f "foundation_model.onnx" ]; then
    echo "🧠 Training foundation model (this may take 2-5 minutes)..."
    python train_foundation_model.py
else
    echo "✅ Foundation model already exists"
fi

# Train intent embedder
if [ ! -f "intent_embedder.onnx" ]; then
    echo "🤖 Training intent embedder with Transformer (this may take 2-5 minutes)..."
    python train_intent_embedder.py
else
    echo "✅ Intent embedder model already exists"
fi

echo ""
echo "✅ All models generated successfully!"
echo ""
echo "📁 Generated files:"
ls -lh *.onnx *.pt 2>/dev/null || echo "   (No model files found)"
echo ""
echo "📊 Training data:"
ls -lh synthetic_ux_dataset.json 2>/dev/null || echo "   (No data file found)"
echo ""
echo "🎉 Setup complete! You can now:"
echo "   1. Commit the models: git add ml-training/*.onnx ml-training/*.pt"
echo "   2. Push to GitHub: git commit -m 'feat: Add trained ML models' && git push"
echo "   3. Share your repo link with confidence!"
echo ""
