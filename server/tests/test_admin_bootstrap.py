import os

from fastapi.testclient import TestClient

os.environ["TESTING"] = "1"

from src.main import app  # noqa: E402


def test_admin_bootstrap_endpoint_removed_in_prod_auth():
    # Legacy endpoint removed after introducing dashboard auth/orgs/projects.
    with TestClient(app) as c:
        r = c.post("/api/v1/admin/bootstrap?name=Acme")
        assert r.status_code == 404
