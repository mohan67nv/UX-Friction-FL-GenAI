import os

from fastapi.testclient import TestClient

from src.main import app


def test_global_sync_key_required(monkeypatch):
    monkeypatch.setenv("GLOBAL_SYNC_KEY", "secret")

    with TestClient(app) as c:
        r = c.get("/api/v1/global-sync/model/latest", params={"project_id": "x"})
        assert r.status_code == 401
