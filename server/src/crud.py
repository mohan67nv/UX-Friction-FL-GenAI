from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import Select, and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .auth import hash_password
from .database import APIKey, FrictionEvent, GlobalModel, Organization, OrgMember, Project, User, AsyncSessionLocal


def slugify(name: str) -> str:
    return (
        name.strip()
        .lower()
        .replace("_", "-")
        .replace(" ", "-")
        .replace("--", "-")
    )


# ------------------------------
# Users
# ------------------------------


async def create_user(db: AsyncSession, email: str, password: str, name: str | None) -> User:
    u = User(email=email, password_hash=hash_password(password), name=name)
    db.add(u)
    await db.flush()
    return u


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    res = await db.execute(select(User).where(User.email == email))
    return res.scalar_one_or_none()


# ------------------------------
# Orgs / Membership
# ------------------------------


async def create_org_with_owner(db: AsyncSession, owner_id: str, name: str) -> Organization:
    org = Organization(name=name, slug=slugify(name))
    db.add(org)
    await db.flush()

    db.add(OrgMember(organization_id=org.id, user_id=owner_id, role="owner"))
    return org


async def get_user_role_in_org(db: AsyncSession, user_id: str, org_id: str) -> str | None:
    res = await db.execute(
        select(OrgMember.role).where(and_(OrgMember.user_id == user_id, OrgMember.organization_id == org_id)).limit(1)
    )
    row = res.first()
    return str(row[0]) if row else None


async def list_org_members(db: AsyncSession, org_id: str) -> list[tuple[str, str, str]]:
    # (user_id, email, role)
    res = await db.execute(
        select(User.id, User.email, OrgMember.role)
        .join(OrgMember, OrgMember.user_id == User.id)
        .where(OrgMember.organization_id == org_id)
        .order_by(User.email.asc())
    )
    return [(str(r[0]), str(r[1]), str(r[2])) for r in res.all()]


async def add_org_member(db: AsyncSession, org_id: str, user_id: str, role: str) -> None:
    db.add(OrgMember(organization_id=org_id, user_id=user_id, role=role))


async def list_orgs_for_user(db: AsyncSession, user_id: str) -> list[Organization]:
    res = await db.execute(
        select(Organization)
        .join(OrgMember, OrgMember.organization_id == Organization.id)
        .where(OrgMember.user_id == user_id)
        .order_by(Organization.created_at.desc())
    )
    return list(res.scalars().all())


async def get_user_role_for_project(db: AsyncSession, user_id: str, project_id: str) -> str | None:
    res = await db.execute(
        select(OrgMember.role)
        .join(Organization, Organization.id == OrgMember.organization_id)
        .join(Project, Project.organization_id == Organization.id)
        .where(and_(OrgMember.user_id == user_id, Project.id == project_id))
        .limit(1)
    )
    row = res.first()
    return str(row[0]) if row else None


async def require_project_access(db: AsyncSession, user_id: str, project_id: str) -> str:
    role = await get_user_role_for_project(db, user_id, project_id)
    if not role:
        raise PermissionError("No access")
    return role


# ------------------------------
# Projects + API Keys
# ------------------------------


def generate_api_key() -> str:
    return "pe_" + secrets.token_urlsafe(32)


async def create_project(db: AsyncSession, org_id: str, name: str, domain: str | None, privacy_mode: str = "high") -> tuple[Project, str]:
    project = Project(organization_id=org_id, name=name, domain=domain, privacy_mode=privacy_mode)
    db.add(project)
    await db.flush()

    api_key = await create_api_key(db, project.id, name="Default")
    return project, api_key


async def create_api_key(db: AsyncSession, project_id: str, name: str = "Key") -> str:
    plain = generate_api_key()
    key_prefix = plain[:10]
    key_hash = hash_password(plain)
    db.add(APIKey(project_id=project_id, key_hash=key_hash, key_prefix=key_prefix, name=name))
    return plain


async def list_api_keys(db: AsyncSession, project_id: str) -> list[APIKey]:
    res = await db.execute(
        select(APIKey)
        .where(and_(APIKey.project_id == project_id, APIKey.revoked_at.is_(None)))
        .order_by(APIKey.created_at.desc())
    )
    return list(res.scalars().all())


async def revoke_api_key(db: AsyncSession, key_id: str, project_id: str) -> None:
    await db.execute(
        update(APIKey)
        .where(and_(APIKey.id == key_id, APIKey.project_id == project_id))
        .values(revoked_at=datetime.now(timezone.utc))
    )


async def validate_api_key(db: AsyncSession, api_key: str) -> str | None:
    # Brute force for now (OK for SQLite dev). In production, store sha256 lookup.
    keys = (await db.execute(select(APIKey).where(APIKey.revoked_at.is_(None)))).scalars().all()

    from .auth import verify_password

    for k in keys:
        if verify_password(api_key, k.key_hash):
            await db.execute(update(APIKey).where(APIKey.id == k.id).values(last_used_at=datetime.now(timezone.utc)))
            return k.project_id
    return None


async def list_projects_for_user(db: AsyncSession, user_id: str) -> list[Project]:
    res = await db.execute(
        select(Project)
        .join(Organization, Organization.id == Project.organization_id)
        .join(OrgMember, OrgMember.organization_id == Organization.id)
        .where(OrgMember.user_id == user_id)
        .order_by(Project.created_at.desc())
    )
    return list(res.scalars().all())


async def update_project(
    db: AsyncSession,
    project_id: str,
    *,
    name: str | None = None,
    domain: str | None = None,
    privacy_mode: str | None = None,
    is_active: bool | None = None,
) -> None:
    values = {}
    if name is not None:
        values[Project.name] = name
    if domain is not None:
        values[Project.domain] = domain
    if privacy_mode is not None:
        values[Project.privacy_mode] = privacy_mode
    if is_active is not None:
        values[Project.is_active] = is_active

    if not values:
        return

    await db.execute(update(Project).where(Project.id == project_id).values(**{c.key: v for c, v in values.items()}))


def select_latest_model(project_id: str) -> Select:
    return (
        select(GlobalModel.weights_json, GlobalModel.version)
        .where(GlobalModel.project_id == project_id)
        .order_by(GlobalModel.version.desc())
        .limit(1)
    )


# ------------------------------
# Analytics: hourly bucket upsert
# ------------------------------


def hour_bucket(ts_ms: int) -> str:
    dt = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc)
    dt = dt.replace(minute=0, second=0, microsecond=0)
    return dt.isoformat().replace("+00:00", "Z")


async def increment_friction_event(
    db: AsyncSession,
    project_id: str,
    metric_type: str,
    ts_ms: int,
    count: int,
    intensity: float | None = None,
    page_url_hash: str | None = None,
    top_element_hash: str | None = None,
    device_type: str | None = None,
) -> None:
    bucket = hour_bucket(ts_ms)

    # Upsert-like behavior for SQLite: try update, if 0 rows then insert
    res = await db.execute(
        update(FrictionEvent)
        .where(
            and_(
                FrictionEvent.hour == bucket,
                FrictionEvent.project_id == project_id,
                FrictionEvent.metric_type == metric_type,
            )
        )
        .values(event_count=FrictionEvent.event_count + count)
    )

    if res.rowcount == 0:
        db.add(
            FrictionEvent(
                hour=bucket,
                project_id=project_id,
                metric_type=metric_type,
                event_count=count,
                avg_intensity=intensity,
                page_url_hash=page_url_hash,
                top_element_hash=top_element_hash,
                device_type=device_type,
            )
        )


async def query_timeseries(db: AsyncSession, project_id: str, hours: int) -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    cutoff_hour = cutoff.replace(minute=0, second=0, microsecond=0).isoformat().replace("+00:00", "Z")

    rows = await db.execute(
        select(FrictionEvent.hour, FrictionEvent.metric_type, func.sum(FrictionEvent.event_count))
        .where(and_(FrictionEvent.project_id == project_id, FrictionEvent.hour >= cutoff_hour))
        .group_by(FrictionEvent.hour, FrictionEvent.metric_type)
        .order_by(FrictionEvent.hour.asc())
    )

    return [
        {"hour": r[0], "metric_type": r[1], "count": int(r[2])}
        for r in rows.all()
    ]
