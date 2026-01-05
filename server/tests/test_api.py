import pytest
from fastapi.testclient import TestClient

from src.main import app


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


def test_health(client: TestClient):
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


def test_model_download_requires_api_key(client: TestClient):
    r = client.get("/api/v1/model/download")
    assert r.status_code == 401


def test_unknown_api_key_rejected(client: TestClient):
    r = client.get("/api/v1/model/download", headers={"x-api-key": "pe_invalid_key"})
    assert r.status_code == 401


def test_compliance_info_public(client: TestClient):
    r = client.get("/api/v1/compliance/info")
    assert r.status_code == 200
    assert r.json()["region"] == "DE"


def test_aggregate_and_dashboard(client: TestClient):
    # Create user/org/project to obtain API key
    reg = client.post(
        "/auth/register",
        json={"email": "u@example.com", "password": "password123", "name": "U", "organization_name": "Acme"},
    )
    assert reg.status_code == 200
    token = reg.json()["access_token"]

    orgs = client.get("/dashboard/orgs", headers={"authorization": f"Bearer {token}"})
    assert orgs.status_code == 200
    org_id = orgs.json()[0]["id"]

    proj = client.post(
        "/dashboard/projects",
        headers={"authorization": f"Bearer {token}"},
        json={"organization_id": org_id, "name": "Site", "domain": "example.com", "privacy_mode": "high"},
    )
    assert proj.status_code == 200
    api_key = proj.json()["api_key"]

    model = client.get("/api/v1/model/download", headers={"x-api-key": api_key})
    assert model.status_code == 200

    import time

    upd = {
        "client_id": "a" * 64,
        "weight_delta": {"tensors": [{"shape": [1, 1], "data": [0.5]}]},
        "num_samples": 10,
        "timestamp": int(time.time() * 1000),
    }

    r = client.post("/api/v1/aggregate", headers={"x-api-key": api_key}, json=upd)
    assert r.status_code == 200

    opt = client.post(
        "/api/v1/privacy/optout",
        headers={"x-api-key": api_key},
        json={"client_id": upd["client_id"], "ttl_days": 30},
    )
    assert opt.status_code == 200

    r2 = client.post("/api/v1/aggregate", headers={"x-api-key": api_key}, json=upd)
    assert r2.status_code == 200
    assert r2.json()["status"] == "ignored"

    dash = client.get("/api/v1/dashboard/friction?time_range=24h", headers={"x-api-key": api_key})
    assert dash.status_code == 200
    data = dash.json()
    assert data["rage_click_incidents"] >= 5
