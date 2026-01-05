from __future__ import annotations

import os
from datetime import datetime, timezone

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from . import crud
from .database import GlobalModel
from .model_merge import merge_weights_json
from .selfhost_config import SelfHostConfig


async def export_latest_model(db: AsyncSession, project_id: str) -> tuple[str | None, int | None]:
    res = await db.execute(crud.select_latest_model(project_id))
    row = res.first()
    if not row:
        return None, None
    weights_json = row[0]
    version = int(row[1])
    return str(weights_json), version


async def upload_model_update(
    *,
    cfg: SelfHostConfig,
    project_id: str,
    weights_json: str,
    version: int,
) -> None:
    if not cfg.global_sync.enabled:
        return
    if cfg.offline_mode:
        return

    url = cfg.global_sync.endpoint.rstrip("/") + "/api/v1/global-sync/upload"

    payload = {
        "deployment_name": cfg.deployment_name,
        "deployment_id": cfg.global_sync.deployment_id or cfg.deployment_name,
        "project_id": project_id,
        "model_version": version,
        "weights_json": weights_json,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dp": {"enabled": cfg.privacy.dp_enabled, "epsilon": cfg.privacy.epsilon},
    }

    headers = {}
    if cfg.global_sync.api_key:
        headers["x-sync-key"] = cfg.global_sync.api_key

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(url, json=payload, headers=headers)
        r.raise_for_status()


async def download_global_model(
    *,
    cfg: SelfHostConfig,
    project_id: str,
) -> str | None:
    if not cfg.global_sync.enabled:
        return None
    if cfg.offline_mode:
        return None

    url = cfg.global_sync.endpoint.rstrip("/") + f"/api/v1/global-sync/model/latest?project_id={project_id}"
    headers = {}
    if cfg.global_sync.api_key:
        headers["x-sync-key"] = cfg.global_sync.api_key

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url, headers=headers)
        if r.status_code == 404:
            return None
        r.raise_for_status()
        return r.text


async def apply_downloaded_model(db: AsyncSession, project_id: str, weights_json: str) -> None:
    # Merge downloaded (global) model into the current local model.
    res = await db.execute(crud.select_latest_model(project_id))
    row = res.first()
    version = int(row[1]) if row else 0

    if row:
        local_json = str(row[0])
        merged = merge_weights_json(local_json=local_json, global_json=weights_json, local_weight=0.7)
    else:
        merged = weights_json

    db.add(GlobalModel(project_id=project_id, version=version + 1, weights_json=merged, num_contributors=0))
