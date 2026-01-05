import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client():
    from src.main import app

    with TestClient(app) as c:
        yield c


def test_ux_auditor_requires_auth(client: TestClient):
    r = client.post(
        "/dashboard/ux-auditor/ask",
        json={"project_id": "x", "question": "Why?", "time_range": "24h", "lang": "en"},
    )
    assert r.status_code == 401


def test_ux_auditor_works_heuristic_mode(client: TestClient):
    # Register -> create project -> ask
    reg = client.post(
        "/auth/register",
        json={"email": "genai@example.com", "password": "password123", "name": "U", "organization_name": "Acme"},
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
    project_id = proj.json()["project_id"]

    r = client.post(
        "/dashboard/ux-auditor/ask",
        headers={"authorization": f"Bearer {token}"},
        json={"project_id": project_id, "question": "Why are users rage clicking?", "time_range": "24h", "lang": "en"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "answer" in data
    assert isinstance(data.get("evidence"), list)
    assert isinstance(data.get("actions"), list)
    assert isinstance(data.get("confidence"), (int, float))
    assert isinstance(data.get("model"), str)
