from __future__ import annotations

from pydantic import BaseModel, Field


class ChatMessageView(BaseModel):
    id: str
    project_id: str
    role: str
    content: str
    model: str | None = None
    confidence: float | None = None
    created_at: str


class ChatHistoryResponse(BaseModel):
    items: list[ChatMessageView]


class AppendChatMessageRequest(BaseModel):
    project_id: str
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1, max_length=5000)
    model: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
