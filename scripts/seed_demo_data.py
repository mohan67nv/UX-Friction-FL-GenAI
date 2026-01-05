"""Seed demo data for local dashboard preview.

Creates:
- Demo user + org + member (owner)
- Demo project + API key
- FrictionEvent hourly buckets for last N days

Works with SQLite (default) or Postgres depending on DATABASE_URL.

Run:
  python scripts/seed_demo_data.py

Env:
  DATABASE_URL=sqlite:///./privacyedge.db
  DEMO_EMAIL=demo@privacyedge.local
  DEMO_PASSWORD=DemoPassword123!
"""

from __future__ import annotations

import os
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, select

# Ensure we can import server/src as `src.*`
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'server'))

# Ensure a writable default DB if DATABASE_URL is missing or points to an unwritable path.
# IMPORTANT: must be set before importing src.database (engine is created at import time).
# Force working directory to repo root so relative sqlite paths are writable.
os.chdir(ROOT)

if not os.getenv('DATABASE_URL'):
    # Use /tmp by default (generally writable in most environments)
    os.environ['DATABASE_URL'] = "sqlite+aiosqlite:////tmp/privacyedge.db"

# Import server modules
from src.auth import hash_password
from src.database import APIKey, AsyncSessionLocal, FrictionEvent, Organization, OrgMember, Project, User, init_db


DEMO_EMAIL = os.getenv("DEMO_EMAIL", "demo@privacyedge.local")
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "DemoPassword123!")
DEMO_ORG = os.getenv("DEMO_ORG", "PrivacyEdge Demo GmbH")
DEMO_PROJECT = os.getenv("DEMO_PROJECT", "Demo Website")
DEMO_DOMAIN = os.getenv("DEMO_DOMAIN", "demo.example.de")
DAYS = int(os.getenv("DEMO_DAYS", "7"))


def iso_hour(dt: datetime) -> str:
    dt = dt.astimezone(timezone.utc).replace(minute=0, second=0, microsecond=0)
    return dt.isoformat().replace("+00:00", "Z")


async def main() -> None:
    await init_db()

    async with AsyncSessionLocal() as db:
        # Find or create user
        user = (await db.execute(select(User).where(User.email == DEMO_EMAIL))).scalar_one_or_none()
        if not user:
            user = User(email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD), name="Demo User")
            db.add(user)
            await db.flush()

        # Find or create org
        slug = DEMO_ORG.lower().replace(" ", "-")
        org = (await db.execute(select(Organization).where(Organization.slug == slug))).scalar_one_or_none()
        if not org:
            org = Organization(name=DEMO_ORG, slug=slug, plan="demo", monthly_events_limit=10_000_000)
            db.add(org)
            await db.flush()

        # Ensure membership
        mem = (
            await db.execute(
                select(OrgMember).where(and_(OrgMember.organization_id == org.id, OrgMember.user_id == user.id))
            )
        ).scalar_one_or_none()
        if not mem:
            db.add(OrgMember(organization_id=org.id, user_id=user.id, role="owner"))

        # Find or create project
        project = (
            await db.execute(
                select(Project).where(and_(Project.organization_id == org.id, Project.name == DEMO_PROJECT))
            )
        ).scalar_one_or_none()

        if not project:
            project = Project(organization_id=org.id, name=DEMO_PROJECT, domain=DEMO_DOMAIN, privacy_mode="high")
            db.add(project)
            await db.flush()

        # Ensure at least one API key exists (we don’t expose it in dashboard list except prefix)
        key = (
            await db.execute(select(APIKey).where(and_(APIKey.project_id == project.id, APIKey.revoked_at.is_(None))))
        ).scalars().first()
        if not key:
            # Create a dummy key for demo (not displayed); real API key creation is via dashboard.
            from src.auth import hash_password
            import secrets

            plain = "pe_" + secrets.token_urlsafe(24)
            key = APIKey(project_id=project.id, key_hash=hash_password(plain), key_prefix=plain[:10], name="Demo")
            db.add(key)

        # Seed friction events (hourly)
        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        start = now - timedelta(days=DAYS)

        # Clear existing demo range to be idempotent
        # (Only for this project)
        # SQLite stores hour as string, so compare lexicographically.
        await db.execute(
            FrictionEvent.__table__.delete().where(
                and_(
                    FrictionEvent.project_id == project.id,
                    FrictionEvent.hour >= iso_hour(start),
                )
            )
        )

        rng = random.Random(42)
        hour = start
        while hour <= now:
            h = iso_hour(hour)

            # Basic seasonality: business hours higher
            is_business = 8 <= hour.hour <= 18
            base = 8 if is_business else 3
            noise = rng.randint(0, 4)

            rage = max(0, int(base * 1.6 + noise + rng.randint(-2, 3)))
            hesitation = max(0, int(base * 1.1 + noise + rng.randint(-2, 2)))
            confusion = max(0, int(base * 0.9 + noise + rng.randint(-2, 2)))
            dead_end = max(0, int(base * 0.4 + rng.randint(0, 2)))

            db.add(FrictionEvent(hour=h, project_id=project.id, metric_type="rage", event_count=rage))
            db.add(FrictionEvent(hour=h, project_id=project.id, metric_type="hesitation", event_count=hesitation))
            db.add(FrictionEvent(hour=h, project_id=project.id, metric_type="confusion", event_count=confusion))
            db.add(FrictionEvent(hour=h, project_id=project.id, metric_type="dead_end", event_count=dead_end))

            hour += timedelta(hours=1)

        await db.commit()

        print("✅ Seed complete")
        print(f"DATABASE_URL used: {os.environ.get('DATABASE_URL')}")
        print(f"Login email: {DEMO_EMAIL}")
        print(f"Login password: {DEMO_PASSWORD}")
        print(f"Project: {project.name} ({project.domain})")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
