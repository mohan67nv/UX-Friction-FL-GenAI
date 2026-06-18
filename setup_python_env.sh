#!/usr/bin/env bash
# Setup Python environment for PrivacyEdge
# This script tries venv first, falls back to Docker if venv is unavailable

set -e

VENV_NAME="uxfriction"
PROJECT_ROOT="$(pwd)"

echo "🔧 Setting up Python environment..."
echo ""

# Check if venv already exists
if [ -d "$VENV_NAME" ]; then
    echo "✅ Virtual environment '$VENV_NAME' already exists"
    echo ""
    echo "To activate it, run:"
    echo "  source $VENV_NAME/bin/activate"
    echo ""
    echo "To install dependencies:"
    echo "  pip install -r requirements.txt"
    echo "  pip install -r requirements-ml.txt  # Optional: for ML training"
    exit 0
fi

# Try to create venv
echo "📦 Attempting to create venv: $VENV_NAME"
if python3 -m venv "$VENV_NAME" 2>/dev/null; then
    echo "✅ Virtual environment created successfully!"
    
    # Activate and install dependencies
    source "$VENV_NAME/bin/activate"
    
    echo "📥 Upgrading pip..."
    pip install --upgrade pip --quiet
    
    echo "📥 Installing server dependencies..."
    pip install -r requirements.txt --quiet
    
    echo "📥 Installing ML training dependencies..."
    pip install -r requirements-ml.txt --quiet
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "To activate the environment:"
    echo "  source $VENV_NAME/bin/activate"
    echo ""
    echo "To deactivate:"
    echo "  deactivate"
    echo ""
    
else
    echo "❌ Failed to create venv (python3-venv not installed)"
    echo ""
    echo "📦 Alternative: Using Docker"
    echo ""
    echo "You've been successfully using Docker for training."
    echo "To install python3-venv (requires sudo):"
    echo ""
    echo "  sudo apt install python3.12-venv"
    echo ""
    echo "Or continue using Docker:"
    echo ""
    echo "  # Run Python commands:"
    echo "  docker run --rm -v \"\$PWD:/work\" -w /work python:3.11-slim python <script.py>"
    echo ""
    echo "  # Interactive shell:"
    echo "  docker run --rm -it -v \"\$PWD:/work\" -w /work python:3.11-slim bash"
    echo ""
    echo "  # Or use docker-compose:"
    echo "  docker-compose up server"
    echo ""
    exit 1
fi
