from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

# Supabase Integration
from .supabase_client import verify_supabase_jwt, get_supabase_service

JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET") or os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = int(os.getenv("JWT_EXP_HOURS", "24"))

# Use pbkdf2_sha256 for maximum compatibility (Python 3.13, avoids bcrypt backend issues)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: str, email: str) -> str:
    """
    Create JWT token (legacy, for backwards compatibility)
    Note: With Supabase Auth, use Supabase tokens instead
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=JWT_EXP_HOURS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode JWT token (supports both legacy and Supabase tokens)
    """
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Get current user from JWT token
    Supports both legacy JWT and Supabase JWT tokens
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = credentials.credentials
    
    # Try Supabase JWT verification first
    try:
        supabase_user = verify_supabase_jwt(token)
        if supabase_user:
            # Return user data in expected format
            return {
                "sub": supabase_user["supabase_id"],
                "email": supabase_user["email"],
                "supabase_id": supabase_user["supabase_id"],
                "email_verified": supabase_user.get("email_verified", False),
            }
    except Exception as e:
        print(f"Supabase JWT verification failed, trying legacy: {e}")
    
    # Fallback to legacy JWT (for backwards compatibility)
    try:
        return decode_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def register_with_supabase(email: str, password: str, name: str = None) -> dict:
    """
    Register user with Supabase Auth
    
    Returns:
        dict with user data and session tokens
    """
    try:
        supabase = get_supabase_service()
        
        # Sign up with Supabase Auth
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "name": name or email.split("@")[0],
                }
            }
        })
        
        if response.user:
            return {
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "name": name or email.split("@")[0],
                },
                "session": {
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token,
                    "expires_at": response.session.expires_at,
                } if response.session else None,
            }
        
        raise HTTPException(status_code=400, detail="Registration failed")
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")


async def login_with_supabase(email: str, password: str) -> dict:
    """
    Login user with Supabase Auth
    
    Returns:
        dict with user data and session tokens
    """
    try:
        supabase = get_supabase_service()
        
        # Sign in with Supabase Auth
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })
        
        if response.user and response.session:
            return {
                "user": {
                    "id": response.user.id,
                    "email": response.user.email,
                    "name": response.user.user_metadata.get("name", email.split("@")[0]),
                },
                "session": {
                    "access_token": response.session.access_token,
                    "refresh_token": response.session.refresh_token,
                    "expires_at": response.session.expires_at,
                },
            }
        
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")

