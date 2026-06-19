# Quick Setup Instructions

## 🚀 You Have Two Options:

### **Option 1: Use Docker (Easiest - Recommended)**

No need to install Python packages! Just use Docker:

```bash
cd /home/mnvgowda/MNVProjects/ZeroBanner-FL-GenAI

# Run training in Docker container
docker run --rm -v "$(pwd)/ml-training:/workspace" -w /workspace \
  python:3.11-slim bash -c "
    pip install -q numpy torch onnx && \
    python generate_synthetic_data.py && \
    python train_foundation_model.py && \
    python train_intent_embedder.py
  "
```

**Time**: 5-8 minutes total (including package install)

---

### **Option 2: Install Python Packages Locally**

You need to install `python3-venv` first:

```bash
# Install venv support
sudo apt install python3-venv python3-pip

# Create virtual environment
cd ml-training
python3 -m venv .venv

# Activate it
source .venv/bin/activate

# Install dependencies
pip install numpy torch onnx

# Train models
python generate_synthetic_data.py   # 30 seconds
python train_foundation_model.py    # 2-3 minutes
python train_intent_embedder.py     # 2-4 minutes
```

**Time**: 5-8 minutes (after package install)

---

## ⚡ **Fastest Method (If You Trust Me)**

Since you're on Ubuntu/Debian, use the system package manager:

```bash
# Install Python ML packages from system repos
sudo apt update
sudo apt install python3-numpy python3-torch python3-onnx

# Then run training
cd ml-training
python3 generate_synthetic_data.py
python3 train_foundation_model.py
python3 train_intent_embedder.py
```

**Note**: System packages might be older versions, but they'll work fine for this!

---

## 🎯 **What You're Asking About**

### **"Does it take 30 minutes?"**
❌ **NO** - I was being too conservative!

**Actual time**:
- Data generation: 30 seconds
- Foundation model: 2-3 minutes
- Intent embedder: 2-4 minutes
- **Total: 5-8 minutes**

### **"What is ONNX?"**
See [WHAT_IS_ONNX.md](WHAT_IS_ONNX.md) for full explanation!

**Short version**: 
- ONNX = Universal ML model format
- Train in Python → Export to ONNX → Run in browser
- Enables privacy-first on-device inference
- That's why your project uses it!

---

## 🆘 **Having Issues?**

If none of the above work, you have one more option:

**Skip training and use pre-trained models from another source:**
- Tell your employer: "Models need to be trained before use"
- Run the training during the interview if they want to see it
- Focus on showing the FL code and architecture instead

The **code quality and FL implementation** are what matter most anyway! 🚀

---

## ✅ **My Recommendation**

Use **Option 1 (Docker)** if you have Docker installed. It's the cleanest and doesn't mess with your system Python.

Run this single command:
```bash
cd /home/mnvgowda/MNVProjects/ZeroBanner-FL-GenAI/ml-training
docker run --rm -v "$(pwd):/work" -w /work python:3.11 bash -c \
  "pip install numpy torch onnx && python generate_synthetic_data.py && \
   python train_foundation_model.py && python train_intent_embedder.py"
```

That's it! ✨
