from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), index=True)

    priority: Mapped[str] = mapped_column(String(20), default="high")  # critical/high/medium/low
    status: Mapped[str] = mapped_column(String(20), default="open")  # open/done/dismissed

    # Stored German-first. English fields are optional for switch.
    title: Mapped[str] = mapped_column(String(255))
    title_en: Mapped[str | None] = mapped_column(String(255), nullable=True)
    metric_type: Mapped[str] = mapped_column(String(50), default="rage")

    what_text: Mapped[str] = mapped_column(Text)
    what_text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    why_text: Mapped[str] = mapped_column(Text)
    why_text_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    who_text: Mapped[str] = mapped_column(Text)
    who_text_en: Mapped[str | None] = mapped_column(Text, nullable=True)

    confidence: Mapped[float] = mapped_column(Float, default=0.8)

    incidents_week: Mapped[int] = mapped_column(Integer, default=0)
    cost_week_eur: Mapped[float] = mapped_column(Float, default=0.0)
    impact_month_eur: Mapped[float] = mapped_column(Float, default=0.0)

    fix_summary: Mapped[str] = mapped_column(Text)
    fix_summary_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    fix_code: Mapped[str] = mapped_column(Text)
    fix_code_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    effort_minutes: Mapped[int] = mapped_column(Integer, default=30)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("project_id", "title", name="uq_reco_project_title"),)
