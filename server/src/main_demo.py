"""Demo entrypoint: run API with in-memory SQLite and seed demo data on startup.

Run:
  TESTING=1 DATABASE_URL=sqlite+aiosqlite:///:memory: uvicorn server.src.main_demo:app --port 8000

Then run the dashboard and log in using printed credentials.
"""

import os

# Force in-memory DB
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from .app import app  # noqa: E402
from .database import AsyncSessionLocal, init_db  # noqa: E402
from .demo_seed import seed_demo  # noqa: E402


@app.on_event("startup")
async def _seed():
    await init_db()
    async with AsyncSessionLocal() as db:
        creds = await seed_demo(db)
        await db.commit()
        print("\n=== ZeroBanner DEMO seeded ===")
        print("Login:", creds["email"], creds["password"])
        print("==============================\n")
