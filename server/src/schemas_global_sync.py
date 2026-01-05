from __future__ import annotations

from pydantic import BaseModel


class GlobalSyncUpload(BaseModel):
    deployment_name: str
    deployment_id: str
    project_id: str
    model_version: int
    weights_json: str
    timestamp: str
    dp: dict
