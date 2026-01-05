import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from src.main import app


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


def test_intent_embedder_onnx_missing_returns_404(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("INTENT_EMBEDDER_ONNX_PATH", "/tmp/does-not-exist.onnx")
    r = client.get("/api/v1/model/intent-embedder.onnx")
    assert r.status_code == 404


def test_intent_embedder_onnx_served_when_present(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    with tempfile.NamedTemporaryFile(suffix=".onnx", delete=False) as f:
        f.write(b"fake-onnx")
        path = f.name

    try:
        monkeypatch.setenv("INTENT_EMBEDDER_ONNX_PATH", path)
        r = client.get("/api/v1/model/intent-embedder.onnx")
        assert r.status_code == 200
        assert r.content == b"fake-onnx"
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass
