from __future__ import annotations

"""Docker-friendly demo harness.

Run inside the API container:

  python -m server.src.demo_harness

This will:
- ensure a demo user/org/project exist
- seed friction time series (last N days)
- seed demo recommendations
- optionally simulate federated learning updates (FedAvg) and differential privacy

This is intended for interview demos.
"""

import asyncio
import os
import random
import time
from datetime import datetime, timedelta, timezone

import numpy as np
from sqlalchemy import and_, select

from .database import AsyncSessionLocal, init_db
from .demo_seed import seed_demo
from .schemas import RegisterRequest
from .weights import ModelWeights


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except Exception:
        return default


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except Exception:
        return default


async def _simulate_fedavg_rounds(*, project_id: str, rounds: int, clients_per_round: int) -> None:
    """Simulate client updates by calling the same aggregator code path used by /api/v1/aggregate."""

    from .app import aggregator
    from .app import FederatedUpdate, Cohorts

    for r in range(rounds):
        async with AsyncSessionLocal() as db:
            for c in range(clients_per_round):
                # Fake 64-hex client id
                cid = (f"{r:08x}{c:08x}" * 4)[:64]

                # tiny model delta: 1x1 tensor with a rage ratio signal
                rage_ratio = float(0.05 + (c / max(1, clients_per_round)) * 0.15)
                mw = ModelWeights.from_numpy([np.array([[rage_ratio]], dtype=np.float32)])

                upd = FederatedUpdate(
                    client_id=cid,
                    weight_delta=mw,
                    num_samples=100 + c * 10,
                    timestamp=int(time.time() * 1000),
                    cohorts=Cohorts(device_type="mobile" if c % 2 == 0 else "desktop", browser_family="safari" if c % 3 == 0 else "chrome"),
                    intent_embedding=None,
                )
                await aggregator.add_update(project_id, upd)

            # aggregate once per round
            await aggregator.aggregate(db)
            await db.commit()


async def main() -> None:
    await init_db()

    # Seed base demo data (user/org/project/recommendations/friction series)
    async with AsyncSessionLocal() as db:
        creds = await seed_demo(db)
        await db.commit()

        # Resolve the seeded project_id
        from .database import Project, Organization

        # Resolve the seeded org/project (keep robust across renames)
        org = (
            await db.execute(
                select(Organization).where(Organization.slug.in_(["zerobanner-demo-gmbh", "zerobanner-demo-gmbh"]))
            )
        ).scalars().first()
        if not org:
            raise RuntimeError("Demo org not found after seeding")

        project = (
            await db.execute(
                select(Project).where(and_(Project.organization_id == org.id, Project.name.in_(["Demo Website", "Website"])) )
            )
        ).scalars().first()
        if not project:
            # fallback: pick any project in org
            project = (
                await db.execute(select(Project).where(Project.organization_id == org.id).limit(1))
            ).scalars().first()
        if not project:
            raise RuntimeError("Demo project not found after seeding")

    rounds = _env_int("DEMO_FL_ROUNDS", 1)
    clients = _env_int("DEMO_FL_CLIENTS_PER_ROUND", 5)

    if rounds > 0 and clients > 0:
        await _simulate_fedavg_rounds(project_id=project.id, rounds=rounds, clients_per_round=clients)

    print("\n=== Demo harness complete ===")
    print(f"Login: {creds['email']} / {creds['password']}")
    print("Dashboard: http://localhost:3000 (ZeroBanner)")
    print("API docs:  http://localhost:8000/docs")


if __name__ == "__main__":
    asyncio.run(main())
