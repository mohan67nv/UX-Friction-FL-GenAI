from fastapi.testclient import TestClient

from src.main import app


def test_global_sync_routes_exist():
    with TestClient(app) as c:
        # latest currently returns 404 by design (stub)
        r = c.get('/api/v1/global-sync/model/latest?project_id=abc')
        assert r.status_code in (401, 404)
