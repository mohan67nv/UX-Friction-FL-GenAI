from fastapi.testclient import TestClient

from src.main import app


def test_global_sync_upload_and_latest():
    with TestClient(app) as c:
        project_id = "123e4567-e89b-12d3-a456-426614174000"
        weights = '{"tensors": [{"shape": [1, 1], "data": [0.42]}]}'

        up = c.post(
            "/api/v1/global-sync/upload",
            json={
                "deployment_name": "test",
                "deployment_id": "dep1",
                "project_id": project_id,
                "model_version": 1,
                "weights_json": weights,
                "timestamp": "now",
                "dp": {"enabled": True, "epsilon": 1.0},
            },
        )
        assert up.status_code == 200

        latest = c.get("/api/v1/global-sync/model/latest", params={"project_id": project_id})
        assert latest.status_code == 200
        assert "tensors" in latest.text
