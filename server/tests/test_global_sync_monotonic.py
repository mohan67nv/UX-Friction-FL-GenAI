from fastapi.testclient import TestClient

from src.main import app


def test_global_sync_rejects_non_monotonic_version():
    with TestClient(app) as c:
        payload = {
            "deployment_name": "test",
            "deployment_id": "dep1",
            "project_id": "p1",
            "model_version": 2,
            "weights_json": '{"tensors": []}',
            "timestamp": "now",
            "dp": {"enabled": True, "epsilon": 1.0},
        }
        r1 = c.post('/api/v1/global-sync/upload', json=payload)
        assert r1.status_code == 200

        r2 = c.post('/api/v1/global-sync/upload', json=payload)
        assert r2.status_code == 409
