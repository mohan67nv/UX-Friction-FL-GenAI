import pytest
from fastapi.testclient import TestClient

from src.main import app


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c


def test_chat_history_roundtrip(client: TestClient):
    reg = client.post(
        "/auth/register",
        json={"email": "hist@example.com", "password": "password123", "name": "U", "organization_name": "Acme"},
    )
    assert reg.status_code == 200
    token = reg.json()["access_token"]

    orgs = client.get("/dashboard/orgs", headers={"authorization": f"Bearer {token}"})
    org_id = orgs.json()[0]["id"]

    proj = client.post(
        "/dashboard/projects",
        headers={"authorization": f"Bearer {token}"},
        json={"organization_id": org_id, "name": "Site", "domain": "example.com", "privacy_mode": "high"},
    )
    project_id = proj.json()["project_id"]

    a = client.post(
        "/dashboard/ux-auditor/append",
        headers={"authorization": f"Bearer {token}"},
        json={"project_id": project_id, "role": "user", "content": "Why checkout?"},
    )
    assert a.status_code == 200

    h = client.get(
        f"/dashboard/ux-auditor/history?project_id={project_id}&limit=50",
        headers={"authorization": f"Bearer {token}"},
    )
    assert h.status_code == 200
    items = h.json()["items"]
    assert len(items) >= 1
    assert items[-1]["content"] == "Why checkout?"
