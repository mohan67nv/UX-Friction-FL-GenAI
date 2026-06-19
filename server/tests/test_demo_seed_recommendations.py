from fastapi.testclient import TestClient

from src.main_demo import app


def test_demo_seed_provides_recommendations():
    # Demo app seeds on startup; run basic flow
    with TestClient(app) as c:
        # login
        r = c.post('/auth/login', json={'email': 'demo@zerobanner.local', 'password': 'DemoPassword123!'})
        assert r.status_code == 200
        token = r.json()['access_token']

        # projects
        projects = c.get('/dashboard/projects', headers={'authorization': f'Bearer {token}'}).json()
        assert projects
        pid = projects[0]['id']

        # recommendations
        recos = c.get('/dashboard/recommendations', headers={'authorization': f'Bearer {token}'}, params={'project_id': pid})
        assert recos.status_code == 200
        assert len(recos.json()) >= 1

        top = c.get('/dashboard/recommendations/top', headers={'authorization': f'Bearer {token}'}, params={'project_id': pid})
        assert top.status_code == 200
