from __future__ import annotations

from pydantic import BaseModel, Field


class UXAuditorAskRequest(BaseModel):
    project_id: str
    question: str = Field(..., min_length=3, max_length=2000)
    time_range: str = Field(default="7d", description="Time window for aggregation, e.g. 24h, 7d")
    lang: str = Field(default="de", description="de|en")


class UXAuditorEvidence(BaseModel):
    title: str
    content: str
    source: str


class UXAuditorAction(BaseModel):
    label: str
    description: str
    # Optional structured action id for UI buttons.
    action: str | None = None


class UXAuditorAskResponse(BaseModel):
    answer: str
    evidence: list[UXAuditorEvidence] = []
    actions: list[UXAuditorAction] = []
    confidence: float = 0.0
    model: str = "heuristic"  # e.g. heuristic | openai:gpt-4o-mini | ollama:llama3.1:8b-instruct

