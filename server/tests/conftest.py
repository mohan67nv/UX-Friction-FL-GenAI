import os
import sys
from pathlib import Path

# Add server/ to sys.path so `src.*` imports work in tests
API_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(API_ROOT))

# Force in-memory mode
os.environ.setdefault("TESTING", "1")
# Force override: CI environment may set DATABASE_URL to an unwritable location.
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

import asyncio
import pytest

from src.database import reset_db


@pytest.fixture(autouse=True)
def _reset_schema_each_test():
    asyncio.run(reset_db())
    yield
