from __future__ import annotations

from pydantic import BaseModel, Field


class RecommendationView(BaseModel):
    id: str
    project_id: str
    priority: str
    status: str
    title: str
    metric_type: str
    what_text: str
    why_text: str
    who_text: str
    confidence: float
    incidents_week: int
    cost_week_eur: float
    impact_month_eur: float
    fix_summary: str
    fix_code: str
    effort_minutes: int
    created_at: str


class MarkDoneResponse(BaseModel):
    status: str = "ok"


class BenchmarksResponse(BaseModel):
    ux_health_score: int
    industry_score: int
    rage_rate_per_1k: float
    industry_rage_rate_per_1k: float
    hesitation_rate_pct: float
    industry_hesitation_rate_pct: float
    cart_abandonment_pct: float
    industry_cart_abandonment_pct: float
    notes: list[str]
