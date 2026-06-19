"""
Supabase Client Configuration
Centralized Supabase client for authentication and database operations
"""

import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Global Supabase clients
_supabase_service: Optional[Client] = None
_supabase_anon: Optional[Client] = None


def get_supabase_service() -> Client:
    """
    Get Supabase client with service_role key (bypasses RLS)
    Use for backend operations that need full database access
    """
    global _supabase_service
    
    if _supabase_service is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
            )
        
        _supabase_service = create_client(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            options={
                "auto_refresh_token": True,
                "persist_session": False,
            }
        )
    
    return _supabase_service


def get_supabase_anon() -> Client:
    """
    Get Supabase client with anon key (respects RLS)
    Use for user-facing operations
    """
    global _supabase_anon
    
    if _supabase_anon is None:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env"
            )
        
        _supabase_anon = create_client(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            options={
                "auto_refresh_token": True,
                "persist_session": True,
            }
        )
    
    return _supabase_anon


def verify_supabase_jwt(token: str) -> Optional[dict]:
    """
    Verify Supabase JWT token and return user data
    
    Args:
        token: Supabase access token (JWT)
    
    Returns:
        dict with user data if valid, None if invalid
    """
    try:
        supabase = get_supabase_service()
        user = supabase.auth.get_user(token)
        
        if user and user.user:
            return {
                "supabase_id": user.user.id,
                "email": user.user.email,
                "email_verified": user.user.email_confirmed_at is not None,
                "created_at": user.user.created_at,
            }
        
        return None
    
    except Exception as e:
        print(f"JWT verification failed: {e}")
        return None


async def get_or_create_user_from_supabase(supabase_id: str, email: str, name: str = None):
    """
    Get or create user in our users table linked to Supabase auth.users
    
    Args:
        supabase_id: UUID from Supabase auth.users.id
        email: User email
        name: User display name (optional)
    
    Returns:
        dict with user data from our users table
    """
    from .database import get_db
    from sqlalchemy import select, insert
    from .database import User
    
    async for db in get_db():
        # Try to find existing user
        result = await db.execute(
            select(User).where(User.supabase_id == supabase_id)
        )
        user = result.scalar_one_or_none()
        
        if user:
            # Update last_login
            user.last_login = "NOW()"
            await db.commit()
            await db.refresh(user)
            return user
        
        # Create new user
        new_user = User(
            supabase_id=supabase_id,
            email=email,
            name=name or email.split("@")[0],
            email_verified=True,  # Supabase handles verification
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return new_user


# Test connection on import (optional, for debugging)
def test_connection():
    """Test Supabase connection"""
    try:
        supabase = get_supabase_service()
        # Simple query to test connection
        result = supabase.table("users").select("count", count="exact").execute()
        print(f"✅ Supabase connected! Users table has {result.count} rows")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False


if __name__ == "__main__":
    # Test when run directly
    test_connection()
