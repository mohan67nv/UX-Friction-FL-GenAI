"""Train a small foundation model (PyTorch) and export to ONNX.

Outputs:
- training/foundation_model.pt
- training/foundation_model.onnx

Target properties (MVP):
- Input: 8 features
- Output: 5 classes [rage, hesitation, confusion, satisfaction, neutral]
"""

from __future__ import annotations

import json

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset


class FrictionDetectionModel(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(8, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 5),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def main() -> None:
    import os
    data_path = "synthetic_ux_dataset.json" if os.path.exists("synthetic_ux_dataset.json") else "ml-training/synthetic_ux_dataset.json"
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    X = torch.tensor([s["features"] for s in data], dtype=torch.float32)
    y = torch.tensor([np.argmax(s["label"]) for s in data], dtype=torch.long)

    # train/val split
    n = len(X)
    split = int(0.8 * n)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=128, shuffle=True)

    model = FrictionDetectionModel()
    opt = torch.optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.CrossEntropyLoss()

    for epoch in range(25):
        model.train()
        losses = []
        for bx, by in train_loader:
            opt.zero_grad()
            logits = model(bx)
            loss = loss_fn(logits, by)
            loss.backward()
            opt.step()
            losses.append(float(loss.item()))

        model.eval()
        with torch.no_grad():
            pred = torch.argmax(model(X_val), dim=1)
            acc = (pred == y_val).float().mean().item()

        print(f"epoch {epoch+1:02d} loss={sum(losses)/len(losses):.4f} val_acc={acc:.4f}")

    pt_path = "foundation_model.pt"
    onnx_path = "foundation_model.onnx"
    torch.save(model.state_dict(), pt_path)

    dummy = torch.randn(1, 8)
    torch.onnx.export(
        model,
        dummy,
        onnx_path,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch"}},
        opset_version=17,
    )

    print(f"Saved {pt_path} and {onnx_path}")


if __name__ == "__main__":
    main()
