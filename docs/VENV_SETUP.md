# 🐍 Python Virtual Environment Setup Complete!

## ✅ **Virtual Environment Created: `zerobanner`**

Your Python virtual environment is ready with all dependencies installed!

---

## 🚀 **How to Activate**

### **For Fish Shell** (you're using this):
```fish
source zerobanner/bin/activate.fish
```

### **For Bash/Zsh**:
```bash
source zerobanner/bin/activate
```

### **For Windows**:
```cmd
zerobanner\Scripts\activate
```

---

## ✅ **Installed Dependencies**

### **Server Dependencies** (from requirements.txt):
- ✅ FastAPI 0.115.6
- ✅ Uvicorn 0.34.0
- ✅ SQLAlchemy 2.0.36 (async)
- ✅ Redis 5.2.1
- ✅ Qdrant Client 1.12.1
- ✅ Sentence Transformers 3.3.1
- ✅ LangChain 0.3.14
- ✅ Haystack AI 2.8.0
- ✅ And 100+ other packages

### **ML Training Dependencies** (from requirements-ml.txt):
- ✅ PyTorch 2.5.1
- ✅ ONNX 1.17.0
- ✅ ONNX Runtime 1.20.1
- ✅ NumPy 2.2.1
- ✅ CUDA Toolkit 13.0.2

**Total packages installed**: ~150+

---

## 📝 **Common Commands**

### **1. Activate Environment**
```fish
source zerobanner/bin/activate.fish
```

### **2. Check Python Version**
```fish
python --version
# Output: Python 3.12.3
```

### **3. List Installed Packages**
```fish
pip list
```

### **4. Run Server**
```fish
cd server
python -m uvicorn src.main:app --reload
```

### **5. Run ML Training**
```fish
cd ml-training
python train_foundation_model.py
python train_intent_embedder.py
```

### **6. Deactivate Environment**
```fish
deactivate
```

---

## 🔍 **Verify Installation**

Test that everything works:

```fish
source zerobanner/bin/activate.fish

# Test PyTorch
python -c "import torch; print(f'PyTorch: {torch.__version__}')"

# Test ONNX
python -c "import onnx; print(f'ONNX: {onnx.__version__}')"

# Test FastAPI
python -c "import fastapi; print(f'FastAPI: {fastapi.__version__}')"

# Test server dependencies
python -c "import sqlalchemy, redis, qdrant_client; print('✅ All imports successful')"
```

Expected output:
```
PyTorch: 2.5.1
ONNX: 1.17.0
FastAPI: 0.115.6
✅ All imports successful
```

---

## 📦 **What Was Installed**

### **Installation Summary**:
1. ✅ Created venv: `zerobanner/`
2. ✅ Upgraded pip to 26.1.2
3. ✅ Installed 150+ packages (~3 GB)
4. ✅ Both server & ML training dependencies
5. ✅ Added to .gitignore

### **Package Sources**:
- `requirements.txt` → `server/requirements.txt` (server deps)
- `requirements-ml.txt` → `ml-training/requirements.txt` (ML deps)

---

## 🛠️ **Troubleshooting**

### **Issue: "command not found: python"**
Solution: Activate the venv first!
```fish
source zerobanner/bin/activate.fish
```

### **Issue: "ModuleNotFoundError"**
Solution: Make sure venv is activated and reinstall:
```fish
source zerobanner/bin/activate.fish
pip install -r requirements.txt
pip install -r requirements-ml.txt
```

### **Issue: Want to recreate venv**
Solution:
```fish
rm -rf zerobanner
python3 -m venv zerobanner
source zerobanner/bin/activate.fish
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-ml.txt
```

---

## 🎯 **Quick Start Workflow**

### **Activate + Run Server**:
```fish
source zerobanner/bin/activate.fish
cd server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### **Activate + Train Models**:
```fish
source zerobanner/bin/activate.fish
cd ml-training
python train_foundation_model.py
python train_intent_embedder.py
```

### **Activate + Run Tests**:
```fish
source zerobanner/bin/activate.fish
cd server
pytest tests/ -v
```

---

## 💡 **Pro Tips**

1. **Always activate before running Python commands**:
   ```fish
   source zerobanner/bin/activate.fish
   ```

2. **Check if venv is active**:
   You'll see `(zerobanner)` in your terminal prompt

3. **Update dependencies**:
   ```fish
   pip install --upgrade -r requirements.txt
   ```

4. **Add new dependencies**:
   ```fish
   pip install <package_name>
   # Then add to requirements.txt:
   pip freeze > requirements-frozen.txt
   ```

5. **Use PyCharm/VS Code**:
   - Point to: `/home/mnvgowda/MNVProjects/ZeroBanner-FL-GenAI/zerobanner/bin/python`

---

## ✅ **Status**

- **Venv Location**: `/home/mnvgowda/MNVProjects/ZeroBanner-FL-GenAI/zerobanner/`
- **Python Version**: 3.12.3
- **Pip Version**: 26.1.2
- **Total Size**: ~3 GB
- **Packages**: ~150
- **Git Status**: Added to .gitignore ✅

---

## 🎉 **You're Ready!**

Your Python environment is fully configured. Just activate it before working:

```fish
source zerobanner/bin/activate.fish
```

**Happy coding!** 🚀
