from __future__ import annotations

from pydantic import BaseModel


class APIKeyView(BaseModel):
    id: str
    key_prefix: str
    name: str | None = None
    created_at: str
    last_used_at: str | None = None


class CreateAPIKeyRequest(BaseModel):
    name: str | None = None


class CreateAPIKeyResponse(BaseModel):
    api_key: str
    key: APIKeyView


class RevokeAPIKeyResponse(BaseModel):
    status: str = "revoked"
