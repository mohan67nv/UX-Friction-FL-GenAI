import os

from fastapi.testclient import TestClient

from src.main import app


def test_global_sync_rate_limit(monkeypatch):
    monkeypatch.setenv('GLOBAL_SYNC_RPM', '2')

    with TestClient(app) as c:
        payload = {
            'deployment_name': 'test',
            'deployment_id': 'dep-rate',
            'project_id': 'p1',
            'model_version': 1,
            'weights_json': '{"tensors": [{"shape": [1, 1], "data": [0.1]}]}',
            'timestamp': 'now',
            'dp': {'enabled': True, 'epsilon': 1.0},
        }

        assert c.post('/api/v1/global-sync/upload', json=payload).status_code == 200
        payload['model_version'] = 2
        assert c.post('/api/v1/global-sync/upload', json=payload).status_code == 200
        payload['model_version'] = 3
        assert c.post('/api/v1/global-sync/upload', json=payload).status_code == 429
