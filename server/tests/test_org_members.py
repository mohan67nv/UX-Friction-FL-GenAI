from fastapi.testclient import TestClient

from src.main import app


def test_org_members_requires_permission():
    with TestClient(app) as client:
        reg1 = client.post(
            "/auth/register",
            json={"email": "o1@example.com", "password": "password123", "name": "O1", "organization_name": "Org"},
        )
        token1 = reg1.json()["access_token"]

        reg2 = client.post(
            "/auth/register",
            json={"email": "o2@example.com", "password": "password123", "name": "O2"},
        )
        assert reg2.status_code == 200

        orgs = client.get("/dashboard/orgs", headers={"authorization": f"Bearer {token1}"})
        org_id = orgs.json()[0]["id"]

        # Owner can list members
        m = client.get(f"/dashboard/orgs/{org_id}/members", headers={"authorization": f"Bearer {token1}"})
        assert m.status_code == 200

        # Owner can add member
        add = client.post(
            f"/dashboard/orgs/{org_id}/members",
            headers={"authorization": f"Bearer {token1}"},
            json={"email": "o2@example.com", "role": "viewer"},
        )
        assert add.status_code == 200
