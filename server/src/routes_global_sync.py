from __future__ import annotations

import os

from fastapi import APIRouter, Depends, Header, HTTPException

from .sync_security import InMemoryRateLimiter, check_weights_sane
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_db
from .models_global_sync import GlobalSyncModel

router = APIRouter(prefix="/api/v1/global-sync", tags=["global-sync"])

_rate_limiter: InMemoryRateLimiter | None = None

def _get_rate_limiter() -> InMemoryRateLimiter:
    global _rate_limiter
    limit = int(os.getenv("GLOBAL_SYNC_RPM", "60"))
    if _rate_limiter is None or _rate_limiter.limit != limit:
        _rate_limiter = InMemoryRateLimiter(limit_per_minute=limit)
    return _rate_limiter

# For MVP: accept upload/download with a shared sync key.
# In production: per-customer keys, signed payloads, and allowlist.

def _check_key(x_sync_key: str) -> None:
    # Read at request-time so tests and runtime config changes are respected.
    sync_key = os.getenv("GLOBAL_SYNC_KEY", "")
    if sync_key and x_sync_key != sync_key:
        raise HTTPException(status_code=401, detail="Invalid sync key")


from .schemas_global_sync import GlobalSyncUpload


@router.post("/upload")
async def upload(
    body: GlobalSyncUpload,
    x_sync_key: str = Header(default=""),
    db: AsyncSession = Depends(get_db),
):
    _check_key(x_sync_key)

    # Rate limiting per deployment
    limiter = _get_rate_limiter()
    if not limiter.allow(f"sync:{body.deployment_id}"):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    # Basic payload size limit (prevent abuse)
    if len(body.weights_json.encode('utf-8')) > 1_000_000:
        raise HTTPException(status_code=413, detail="Payload too large")

    # Poisoning heuristics
    try:
        check_weights_sane(body.weights_json)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Suspicious model update: {e}")

    # Version monotonicity per (project_id, deployment_id)
    latest = await db.execute(
        select(GlobalSyncModel.version)
        .where(GlobalSyncModel.project_id == body.project_id, GlobalSyncModel.deployment_id == body.deployment_id)
        .order_by(GlobalSyncModel.version.desc())
        .limit(1)
    )
    row = latest.first()
    if row and int(row[0]) >= body.model_version:
        raise HTTPException(status_code=409, detail="Non-monotonic model_version")

    db.add(
        GlobalSyncModel(
            project_id=body.project_id,
            deployment_id=body.deployment_id,
            version=body.model_version,
            weights_json=body.weights_json,
        )
    )
    return {
        "status": "stored",
        "project_id": body.project_id,
        "deployment_id": body.deployment_id,
        "model_version": body.model_version,
    }


@router.get("/model/latest")
async def latest(
    project_id: str,
    x_sync_key: str = Header(default=""),
    db: AsyncSession = Depends(get_db),
):
    _check_key(x_sync_key)

    res = await db.execute(
        select(GlobalSyncModel.weights_json, GlobalSyncModel.version)
        .where(GlobalSyncModel.project_id == project_id)
        .order_by(GlobalSyncModel.version.desc())
        .limit(1)
    )
    row = res.first()
    if not row:
        raise HTTPException(status_code=404, detail="No global model yet")
    return row[0]
