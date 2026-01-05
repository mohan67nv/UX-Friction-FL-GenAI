from fastapi.testclient import TestClient

from src.main import app


def test_api_key_lifecycle_and_rbac():
    with TestClient(app) as client:
        reg = client.post(
            "/auth/register",
            json={"email": "k@example.com", "password": "password123", "name": "K", "organization_name": "Org"},
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

        # List keys (should require manage_keys, but current user is owner by default)
        keys = client.get(
            f"/dashboard/projects/{project_id}/api-keys",
            headers={"authorization": f"Bearer {token}"},
        )
        assert keys.status_code == 200

        # Create another key
        created = client.post(
            f"/dashboard/projects/{project_id}/api-keys",
            headers={"authorization": f"Bearer {token}"},
            json={"name": "Rotation"},
        )
        assert created.status_code == 200
        key_id = created.json()["key"]["id"]

        revoked = client.post(
            f"/dashboard/projects/{project_id}/api-keys/{key_id}/revoke",
            headers={"authorization": f"Bearer {token}"},
        )
        assert revoked.status_code == 200
