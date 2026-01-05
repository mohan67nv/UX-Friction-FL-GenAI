Foundation model integration (planned)

- The server-side training pipeline (PyTorch) exports ml-training/foundation_model.onnx.
- In the browser, we will load it via ONNX Runtime Web or convert to TF.js.

This SDK currently uses heuristics for friction detection; next step is to add:
- optional dependency: onnxruntime-web
- AIFrictionEngine that runs in <50ms

No .md files were created per workspace rules.
