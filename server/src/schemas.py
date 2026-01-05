from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    name: Optional[str] = None
    organization_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


class CreateProjectRequest(BaseModel):
    organization_id: str
    name: str
    domain: Optional[str] = None
    privacy_mode: str = "high"


class CreateProjectResponse(BaseModel):
    project_id: str
    api_key: str
    message: str


class TimeSeriesPoint(BaseModel):
    hour: str
    metric_type: str
    count: int


class DashboardOverview(BaseModel):
    friction_score: float
    rage_count: int
    hesitation_count: int
    confusion_count: int
    dead_end_count: int
    series: list[TimeSeriesPoint]
