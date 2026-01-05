from __future__ import annotations

from pydantic import BaseModel, Field


class InviteMemberRequest(BaseModel):
    email: str
    role: str = Field(default="viewer")


class OrgMemberView(BaseModel):
    user_id: str
    email: str
    role: str
