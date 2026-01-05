from __future__ import annotations

from fastapi import HTTPException

ROLE_PERMS: dict[str, set[str]] = {
    "owner": {"read", "write", "delete", "manage_billing", "manage_members", "manage_keys"},
    "admin": {"read", "write", "delete", "manage_members", "manage_keys"},
    "member": {"read", "write"},
    "viewer": {"read"},
}


def require_permission(role: str | None, perm: str) -> None:
    if not role:
        raise HTTPException(status_code=403, detail="Not a member")
    if perm not in ROLE_PERMS.get(role, set()):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
