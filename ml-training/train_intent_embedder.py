"""Train a tiny Transformer encoder (BERT-like) for intent embeddings and export to ONNX.

Why "BERT-like"?
- Encoder-only Transformer stack (self-attention)
- Produces a dense embedding + classification logits

Privacy note:
- Input is an 8-float feature vector (no text, no URLs, no identifiers)
- Output embedding is used on-device and only aggregated summaries may be sent

Outputs:
- ml-training/intent_embedder.pt
- ml-training/intent_embedder.onnx
- ml-training/intent_embedder.int8.onnx (dynamic quantized)
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass

import numpy as np
import torch
import torch.nn as nn


class TinyTransformerIntent(nn.Module):
    def __init__(self, *, d_model: int = 64, nhead: int = 4, num_layers: int = 2, emb_dim: int = 64) -> None:
        super().__init__()
        self.in_proj = nn.Linear(8, d_model)
        enc_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, dim_feedforward=128, dropout=0.1, batch_first=True)
        self.encoder = nn.TransformerEncoder(enc_layer, num_layers=num_layers)
        self.pool = nn.AdaptiveAvgPool1d(1)
        self.emb = nn.Linear(d_model, emb_dim)
        self.head = nn.Linear(emb_dim, 5)  # 5 classes

    def forward(self, x: torch.Tensor):
        # x: [B, 8] -> treat as seq_len=1 token with 8 dims
        h = self.in_proj(x).unsqueeze(1)  # [B, 1, d_model]
        h = self.encoder(h)  # [B, 1, d_model]
        # pool over seq dim
        pooled = h.squeeze(1)  # [B, d_model]
        embedding = self.emb(pooled)  # [B, emb_dim]
        logits = self.head(torch.tanh(embedding))
        return embedding, logits


def main() -> None:
    import os as _os
    data_path = "synthetic_ux_dataset.json" if _os.path.exists("synthetic_ux_dataset.json") else "ml-training/synthetic_ux_dataset.json"
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    X = torch.tensor([s["features"] for s in data], dtype=torch.float32)
    y = torch.tensor([int(np.argmax(s["label"])) for s in data], dtype=torch.long)

    n = len(X)
    split = int(0.8 * n)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    model = TinyTransformerIntent()
    opt = torch.optim.AdamW(model.parameters(), lr=2e-3)
    loss_fn = nn.CrossEntropyLoss()

    batch_size = 256
    for epoch in range(8):
        model.train()
        idx = torch.randperm(len(X_train))
        losses = []
        for i in range(0, len(X_train), batch_size):
            b = idx[i : i + batch_size]
            bx = X_train[b]
            by = y_train[b]
            opt.zero_grad()
            emb, logits = model(bx)
            loss = loss_fn(logits, by)
            loss.backward()
            opt.step()
            losses.append(float(loss.item()))

        model.eval()
        with torch.no_grad():
            _, logits = model(X_val)
            pred = torch.argmax(logits, dim=1)
            acc = (pred == y_val).float().mean().item()

        print(f"epoch {epoch+1:02d} loss={sum(losses)/len(losses):.4f} val_acc={acc:.4f}")

    torch.save(model.state_dict(), "intent_embedder.pt")

    # Export ONNX
    dummy = torch.randn(1, 8)
    onnx_path = os.getenv("INTENT_EMBEDDER_ONNX_PATH", "intent_embedder.onnx")

    model.eval()
    torch.onnx.export(
        model,
        dummy,
        onnx_path,
        input_names=["input"],
        output_names=["embedding", "logits"],
        dynamic_axes={"input": {0: "batch"}, "embedding": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
    )
    print(f"Saved {onnx_path}")

    # Dynamic quantization (INT8) for smaller file size
    try:
        from onnxruntime.quantization import QuantType, quantize_dynamic

        q_path = onnx_path.replace(".onnx", ".int8.onnx")
        quantize_dynamic(onnx_path, q_path, weight_type=QuantType.QInt8)
        print(f"Saved {q_path}")
    except Exception as e:
        print(f"Quantization skipped: {e}")


if __name__ == "__main__":
    main()
