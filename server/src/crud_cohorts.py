from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .database import FrictionEvent


async def query_cohort_breakdown(
    db: AsyncSession,
    project_id: str,
    hours: int,
) -> dict[str, dict[str, int]]:
    """Return counts per cohort.

    Output:
      {
        "device_type": {"mobile": 10, "desktop": 5, ...},
        "browser_family": {"safari": 7, "chrome": 8, ...}
      }

    Privacy: aggregated counts only.
    """

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    cutoff_hour = cutoff.replace(minute=0, second=0, microsecond=0).isoformat().replace("+00:00", "Z")

    out: dict[str, dict[str, int]] = {"device_type": {}, "browser_family": {}}

    # device
    rows = await db.execute(
        select(FrictionEvent.device_type, func.sum(FrictionEvent.event_count))
        .where(and_(FrictionEvent.project_id == project_id, FrictionEvent.hour >= cutoff_hour))
        .group_by(FrictionEvent.device_type)
    )
    for device, cnt in rows.all():
        key = str(device or "unknown")
        out["device_type"][key] = int(cnt or 0)

    # browser
    rows2 = await db.execute(
        select(FrictionEvent.browser_family, func.sum(FrictionEvent.event_count))
        .where(and_(FrictionEvent.project_id == project_id, FrictionEvent.hour >= cutoff_hour))
        .group_by(FrictionEvent.browser_family)
    )
    for br, cnt in rows2.all():
        key = str(br or "unknown")
        out["browser_family"][key] = int(cnt or 0)

    return out
