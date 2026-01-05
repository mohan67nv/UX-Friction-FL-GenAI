from fastapi.testclient import TestClient

from src.main import app


def test_recommendations_endpoints_smoke():
    with TestClient(app) as client:
        reg = client.post(
            "/auth/register",
            json={"email": "r@example.com", "password": "password123", "name": "R", "organization_name": "Org"},
        )
        token = reg.json()["access_token"]

        orgs = client.get("/dashboard/orgs", headers={"authorization": f"Bearer {token}"}).json()
        org_id = orgs[0]["id"]

        proj = client.post(
            "/dashboard/projects",
            headers={"authorization": f"Bearer {token}"},
            json={"organization_id": org_id, "name": "Site", "domain": "example.com", "privacy_mode": "high"},
        ).json()
        project_id = proj["project_id"]

        # No recos by default
        top = client.get(
            "/dashboard/recommendations/top",
            headers={"authorization": f"Bearer {token}"},
            params={"project_id": project_id},
        )
        assert top.status_code in (404, 200)

        bench = client.get(
            "/dashboard/benchmarks",
            headers={"authorization": f"Bearer {token}"},
            params={"project_id": project_id},
        )
        assert bench.status_code == 200
