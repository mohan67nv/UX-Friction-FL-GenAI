from fastapi.testclient import TestClient

from src.main import app


def test_project_patch_updates_fields():
    with TestClient(app) as client:
        reg = client.post(
            "/auth/register",
            json={"email": "p@example.com", "password": "password123", "name": "P", "organization_name": "Org"},
        )
        token = reg.json()["access_token"]

        orgs = client.get("/dashboard/orgs", headers={"authorization": f"Bearer {token}"})
        org_id = orgs.json()[0]["id"]

        proj = client.post(
            "/dashboard/projects",
            headers={"authorization": f"Bearer {token}"},
            json={"organization_id": org_id, "name": "Site", "domain": "old.de", "privacy_mode": "high"},
        )
        project_id = proj.json()["project_id"]

        patch = client.patch(
            f"/dashboard/projects/{project_id}",
            headers={"authorization": f"Bearer {token}"},
            json={"domain": "new.de", "privacy_mode": "maximum", "is_active": False},
        )
        assert patch.status_code == 200

        projects = client.get("/dashboard/projects", headers={"authorization": f"Bearer {token}"}).json()
        p = next(x for x in projects if x["id"] == project_id)
        assert p["domain"] == "new.de"
        assert p["privacy_mode"] == "maximum"
        assert p["created_at"]
