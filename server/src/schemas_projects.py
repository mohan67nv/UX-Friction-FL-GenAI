from __future__ import annotations

from pydantic import BaseModel, Field


class UpdateProjectRequest(BaseModel):
    name: str | None = None
    domain: str | None = None
    privacy_mode: str | None = Field(default=None)
    is_active: bool | None = None
