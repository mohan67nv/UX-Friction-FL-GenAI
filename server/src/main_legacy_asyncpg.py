from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import asyncpg
import numpy as np
from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException
import hashlib
import secrets
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from redis import Redis

# ------------------------------
# Settings
# ------------------------------


def _env(name: str, default: str | None = None) -> str:
    v = os.getenv(name)
    if v is None:
        if default is None:
            raise RuntimeError(f"Missing env var: {name}")
        return default
    return v


DATABASE_URL = _env("DATABASE_URL", "postgresql://privacyedge:privacyedge@localhost:5432/privacyedge")
REDIS_URL = _env("REDIS_URL", "redis://localhost:6379/0")
API_KEY_SALT = _env("API_KEY_SALT", "change-me")
CORS_ORIGINS = _env("CORS_ORIGINS", "*")
ADMIN_BOOTSTRAP_TOKEN = os.getenv("ADMIN_BOOTSTRAP_TOKEN", "")

MAX_CLIENTS_PER_ROUND = int(os.getenv("MAX_CLIENTS_PER_ROUND", "100"))
AGGREGATION_INTERVAL_SECONDS = int(os.getenv("AGGREGATION_INTERVAL_SECONDS", "300"))

# Federated learning server-side privacy / robustness
DP_EPSILON = float(os.getenv("DP_EPSILON", "0"))  # 0 disables server-side noise
DP_CLIP_NORM = float(os.getenv("DP_CLIP_NORM", "1.0"))

# Data retention (Germany-first). Metrics are aggregated, but we still bound retention.
METRICS_RETENTION_DAYS = int(os.getenv("METRICS_RETENTION_DAYS", "90"))
OPTOUT_DEFAULT_DAYS = int(os.getenv("OPTOUT_DEFAULT_DAYS", "365"))


# ------------------------------
# Models
# ------------------------------


class HealthCheck(BaseModel):
    status: str
    timestamp: str
    version: str
    privacy_compliant: bool = True


class Project(BaseModel):
    id: str
    name: str
    created_at: str


class BootstrapResponse(BaseModel):
    project: Project
    api_key: str


class Tensor(BaseModel):
    shape: list[int] = Field(..., description="Tensor shape")
    data: list[float] = Field(..., description="Flat row-major data")

    def to_numpy(self) -> np.ndarray:
        arr = np.array(self.data, dtype=np.float32)
        return arr.reshape(self.shape)

    @classmethod
    def from_numpy(cls, arr: np.ndarray) -> "Tensor":
        return cls(shape=list(arr.shape), data=arr.astype(np.float32).ravel().tolist())


class ModelWeights(BaseModel):
    # Backward compatible: accept either `tensors` or `layers`.
    tensors: Optional[list[Tensor]] = None
    layers: Optional[list[list[list[float]]]] = None

    def to_numpy(self) -> list[np.ndarray]:
        if self.tensors is not None:
            return [t.to_numpy() for t in self.tensors]
        if self.layers is not None:
            return [np.array(layer, dtype=np.float32) for layer in self.layers]
        return []

    @classmethod
    def from_numpy(cls, arrays: list[np.ndarray]) -> "ModelWeights":
        return cls(tensors=[Tensor.from_numpy(a) for a in arrays])


class FederatedUpdate(BaseModel):
    client_id: str = Field(..., min_length=64, max_length=64)
    weight_delta: ModelWeights
    num_samples: int = Field(..., gt=0, le=50_000)
    timestamp: int


class FrictionMetrics(BaseModel):
    overall_friction_score: float = Field(..., ge=0, le=100)
    rage_click_incidents: int
    top_rage_elements: list[dict[str, Any]]
    hesitation_hotspots: list[dict[str, Any]]
    confusion_patterns: list[dict[str, Any]]
    time_range: dict[str, str]


class OptOutRequest(BaseModel):
    client_id: str = Field(..., min_length=64, max_length=64, description="Hashed client identifier")
    ttl_days: Optional[int] = Field(default=None, ge=1, le=3650)


class ComplianceInfo(BaseModel):
    region: str
    lawful_basis_recommendation: str
    cookies_required: bool
    pii_stored: bool
    stored_data: list[str]
    not_stored_data: list[str]
    tdddg_banner_required: bool


# ------------------------------
# DB + Aggregation
# ------------------------------


class Database:
    def __init__(self) -> None:
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self) -> None:
        self.pool = await asyncpg.create_pool(DATABASE_URL)
        await self.create_tables()

    async def create_tables(self) -> None:
        assert self.pool
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id VARCHAR(32) PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS api_keys (
                    id SERIAL PRIMARY KEY,
                    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    key_hash VARCHAR(64) NOT NULL UNIQUE,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    revoked_at TIMESTAMPTZ
                );

                CREATE TABLE IF NOT EXISTS global_models (
                    id SERIAL PRIMARY KEY,
                    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    version INTEGER NOT NULL,
                    weights JSONB NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    num_contributors INTEGER DEFAULT 0,
                    UNIQUE(project_id, version)
                );

                CREATE TABLE IF NOT EXISTS client_metadata (
                    id SERIAL PRIMARY KEY,
                    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    client_hash VARCHAR(64) NOT NULL,
                    first_seen TIMESTAMPTZ DEFAULT NOW(),
                    last_update TIMESTAMPTZ DEFAULT NOW(),
                    total_contributions INTEGER DEFAULT 0,
                    UNIQUE(project_id, client_hash)
                );

                CREATE TABLE IF NOT EXISTS friction_metrics (
                    id SERIAL PRIMARY KEY,
                    project_id VARCHAR(32) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    recorded_at TIMESTAMPTZ DEFAULT NOW(),
                    metric_type VARCHAR(50) NOT NULL,
                    aggregated_value JSONB NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_friction_project_time ON friction_metrics(project_id, recorded_at DESC);
                """
            )

    async def get_latest_model(self, project_id: str) -> ModelWeights:
        assert self.pool
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT weights FROM global_models WHERE project_id=$1 ORDER BY version DESC LIMIT 1",
                project_id,
            )
            if row:
                return ModelWeights(**row["weights"])

        return self.initialize_model()

    async def save_model(self, project_id: str, weights: ModelWeights, num_contributors: int) -> None:
        assert self.pool
        async with self.pool.acquire() as conn:
            latest = await conn.fetchval(
                "SELECT COALESCE(MAX(version), 0) FROM global_models WHERE project_id=$1",
                project_id,
            )
            await conn.execute(
                "INSERT INTO global_models (project_id, version, weights, num_contributors) VALUES ($1, $2, $3, $4)",
                project_id,
                int(latest) + 1,
                weights.model_dump(),
                num_contributors,
            )

    async def upsert_client(self, project_id: str, client_hash: str) -> None:
        assert self.pool
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO client_metadata (project_id, client_hash, total_contributions)
                VALUES ($1, $2, 1)
                ON CONFLICT (project_id, client_hash) DO UPDATE SET
                  last_update = NOW(),
                  total_contributions = client_metadata.total_contributions + 1
                """,
                project_id,
                client_hash,
            )

    async def create_project_and_key(self, name: str) -> tuple[Project, str]:
        assert self.pool
        project_id = secrets.token_hex(8)
        api_key_plain = "pe_" + secrets.token_urlsafe(24)
        key_hash = hash_api_key(api_key_plain)

        async with self.pool.acquire() as conn:
            await conn.execute("INSERT INTO projects (id, name) VALUES ($1, $2)", project_id, name)
            await conn.execute(
                "INSERT INTO api_keys (project_id, key_hash) VALUES ($1, $2)", project_id, key_hash
            )
            row = await conn.fetchrow("SELECT id, name, created_at FROM projects WHERE id=$1", project_id)

        assert row
        proj = Project(id=row["id"], name=row["name"], created_at=row["created_at"].isoformat())
        return proj, api_key_plain

    async def get_project_by_key_hash(self, key_hash: str) -> Optional[Project]:
        assert self.pool
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT p.id, p.name, p.created_at
                FROM api_keys k
                JOIN projects p ON p.id = k.project_id
                WHERE k.key_hash=$1 AND k.revoked_at IS NULL
                """,
                key_hash,
            )
        if not row:
            return None
        return Project(id=row["id"], name=row["name"], created_at=row["created_at"].isoformat())

    def initialize_model(self) -> ModelWeights:
        # MVP: tiny "model" placeholder. Later: real NN weights.
        layer = np.zeros((1, 1), dtype=np.float32)
        return ModelWeights.from_numpy([layer])


class FederatedAggregator:
    def __init__(self, db: Database) -> None:
        self.db = db
        self.redis = Redis.from_url(REDIS_URL)
        self.pending: list[tuple[str, FederatedUpdate]] = []  # (project_id, update)

    async def add_update(self, project_id: str, update: FederatedUpdate) -> bool:
        if not self._verify_eligibility(project_id, update.client_id):
            return False
        self.pending.append((project_id, update))
        await self.db.upsert_client(project_id, update.client_id)
        return len(self.pending) >= MAX_CLIENTS_PER_ROUND

    def _verify_eligibility(self, project_id: str, client_id: str) -> bool:
        key = f"round:{project_id}:current:client:{client_id}"
        if self.redis.exists(key):
            return False
        self.redis.setex(key, AGGREGATION_INTERVAL_SECONDS, "1")
        return True

    async def aggregate(self) -> None:
        if not self.pending:
            return

        # Aggregate per project separately
        by_project: dict[str, list[FederatedUpdate]] = {}
        for pid, upd in self.pending:
            by_project.setdefault(pid, []).append(upd)

        for project_id, updates in by_project.items():
            global_model = await self.db.get_latest_model(project_id)
            global_w = global_model.to_numpy()

            total_samples = sum(u.num_samples for u in updates)
            weighted_sum = [np.zeros_like(w) for w in global_w]

            for upd in updates:
                w = upd.num_samples / total_samples
                delta = upd.weight_delta.to_numpy()
                delta = clip_update(delta, DP_CLIP_NORM)
                delta = add_dp_noise(delta, DP_EPSILON, DP_CLIP_NORM) if DP_EPSILON > 0 else delta
                for i in range(min(len(weighted_sum), len(delta))):
                    weighted_sum[i] += w * delta[i]

            new_w = [global_w[i] + weighted_sum[i] for i in range(len(global_w))]
            new_model = ModelWeights.from_numpy(new_w)
            await self.db.save_model(project_id, new_model, num_contributors=len(updates))

        self.pending = []
        return


# ------------------------------
# Security (MVP)
# ------------------------------


def hash_api_key(api_key: str) -> str:
    # SHA-256(salt || api_key)
    h = hashlib.sha256()
    h.update(API_KEY_SALT.encode("utf-8"))
    h.update(api_key.encode("utf-8"))
    return h.hexdigest()


async def get_project(
    x_api_key: str = Header(default=""),
) -> Project:
    if not x_api_key or len(x_api_key) < 16:
        raise HTTPException(status_code=401, detail="Invalid API key")

    key_hash = hash_api_key(x_api_key)
    proj = await db.get_project_by_key_hash(key_hash)  # type: ignore[arg-type]
    if not proj:
        raise HTTPException(status_code=401, detail="Unknown API key")

    # Basic per-key rate limiting (Germany-first: defensive defaults)
    # Limit: 1000 req/min per key
    limit_key = f"rl:{key_hash}:{int(datetime.now(timezone.utc).timestamp() // 60)}"
    try:
        n = aggregator.redis.incr(limit_key)  # type: ignore[attr-defined]
        if n == 1:
            aggregator.redis.expire(limit_key, 70)  # type: ignore[attr-defined]
        if n > 1000:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
    except AttributeError:
        # FakeRedis in tests may not implement incr/expire; ignore.
        pass

    return proj


def validate_client_id(client_id: str) -> bool:
    return len(client_id) == 64 and all(c in "0123456789abcdef" for c in client_id)


def clip_update(delta: list[np.ndarray], clip_norm: float) -> list[np.ndarray]:
    if clip_norm <= 0:
        return delta
    # Compute global L2 norm across all tensors
    squared = 0.0
    for d in delta:
        squared += float(np.sum(np.square(d)))
    norm = float(np.sqrt(squared))
    if norm <= clip_norm or norm == 0:
        return delta
    scale = clip_norm / norm
    return [d * scale for d in delta]


def add_dp_noise(delta: list[np.ndarray], epsilon: float, sensitivity: float) -> list[np.ndarray]:
    # Laplace noise: scale = sensitivity/epsilon
    if epsilon <= 0:
        return delta
    scale = float(sensitivity / epsilon)
    return [d + np.random.laplace(0.0, scale, size=d.shape).astype(np.float32) for d in delta]


async def cleanup_retention() -> None:
    # Delete friction metrics older than retention window.
    if METRICS_RETENTION_DAYS <= 0:
        return
    cutoff = datetime.now(timezone.utc) - timedelta(days=METRICS_RETENTION_DAYS)
    assert db.pool
    async with db.pool.acquire() as conn:
        await conn.execute("DELETE FROM friction_metrics WHERE recorded_at < $1", cutoff)


# ------------------------------
# App
# ------------------------------


app = FastAPI(title="PrivacyEdge Analytics API", version="0.1.0")

origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=False,
    allow_methods=["*"] ,
    allow_headers=["*"],
)

TESTING = os.getenv("TESTING", "0") == "1"


class InMemoryDatabase(Database):
    def __init__(self) -> None:
        super().__init__()
        self._models: dict[str, list[ModelWeights]] = {}
        self._metrics: list[dict[str, Any]] = []
        # one default testing project
        self._projects: dict[str, Project] = {
            "testproj": Project(id="testproj", name="Test Project", created_at=datetime.now(timezone.utc).isoformat())
        }
        self._key_hash_to_project: dict[str, str] = {hash_api_key("x" * 20): "testproj"}

    async def connect(self) -> None:  # type: ignore[override]
        # no-op
        return

    async def create_tables(self) -> None:  # type: ignore[override]
        return

    async def get_latest_model(self, project_id: str) -> ModelWeights:  # type: ignore[override]
        models = self._models.get(project_id, [])
        if models:
            return models[-1]
        return self.initialize_model()

    async def save_model(self, project_id: str, weights: ModelWeights, num_contributors: int) -> None:  # type: ignore[override]
        self._models.setdefault(project_id, []).append(weights)

    async def upsert_client(self, project_id: str, client_hash: str) -> None:  # type: ignore[override]
        return

    async def create_project_and_key(self, name: str) -> tuple[Project, str]:  # type: ignore[override]
        pid = secrets.token_hex(8)
        proj = Project(id=pid, name=name, created_at=datetime.now(timezone.utc).isoformat())
        api_key_plain = "pe_" + secrets.token_urlsafe(24)
        self._projects[pid] = proj
        self._key_hash_to_project[hash_api_key(api_key_plain)] = pid
        return proj, api_key_plain

    async def get_project_by_key_hash(self, key_hash: str) -> Optional[Project]:  # type: ignore[override]
        pid = self._key_hash_to_project.get(key_hash)
        return self._projects.get(pid) if pid else None


class FakeRedis:
    def __init__(self) -> None:
        self._store: dict[str, str] = {}

    def exists(self, key: str) -> bool:
        return key in self._store

    def setex(self, key: str, _ttl: int, value: str) -> None:
        self._store[key] = value

    def incr(self, key: str) -> int:
        v = int(self._store.get(key, "0")) + 1
        self._store[key] = str(v)
        return v

    def expire(self, key: str, _ttl: int) -> None:
        return


class TestFederatedAggregator(FederatedAggregator):
    def __init__(self, db: Database) -> None:
        super().__init__(db)
        self.redis = FakeRedis()  # type: ignore[assignment]


db: Database = InMemoryDatabase() if TESTING else Database()
aggregator = TestFederatedAggregator(db) if TESTING else FederatedAggregator(db)


@app.on_event("startup")
async def _startup() -> None:
    await db.connect()

    # Periodic aggregation (MVP). In production, move to a separate worker.
    import asyncio

    async def _maybe_aggregate():
        if aggregator.pending:
            await aggregator.aggregate()

        # Retention cleanup (aggregated metrics only)
        if not TESTING:
            await cleanup_retention()

    async def _loop():
        while True:
            await asyncio.sleep(AGGREGATION_INTERVAL_SECONDS)
            await _maybe_aggregate()

    asyncio.create_task(_loop())


@app.get("/", response_model=HealthCheck)
async def health() -> HealthCheck:
    return HealthCheck(status="healthy", timestamp=datetime.now(timezone.utc).isoformat(), version="0.1.0")


@app.post("/api/v1/admin/bootstrap", response_model=BootstrapResponse)
async def admin_bootstrap(name: str = "Default Project", x_admin_token: str = Header(default="")) -> BootstrapResponse:
    if not ADMIN_BOOTSTRAP_TOKEN or x_admin_token != ADMIN_BOOTSTRAP_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")

    proj, api_key = await db.create_project_and_key(name)  # type: ignore[arg-type]
    return BootstrapResponse(project=proj, api_key=api_key)


@app.get("/api/v1/model/download", response_model=ModelWeights)
async def model_download(project: Project = Depends(get_project)) -> ModelWeights:
    return await db.get_latest_model(project.id)  # type: ignore[arg-type]


@app.post("/api/v1/privacy/optout")
async def privacy_optout(body: OptOutRequest, project: Project = Depends(get_project)) -> dict[str, Any]:
    if not validate_client_id(body.client_id):
        raise HTTPException(status_code=400, detail="Invalid client_id")

    ttl_days = body.ttl_days or OPTOUT_DEFAULT_DAYS
    ttl_seconds = int(ttl_days * 24 * 3600)
    key = f"optout:{project.id}:{body.client_id}"
    aggregator.redis.setex(key, ttl_seconds, "1")
    return {"status": "ok", "ttl_days": ttl_days}


@app.get("/api/v1/compliance/info", response_model=ComplianceInfo)
async def compliance_info() -> ComplianceInfo:
    return ComplianceInfo(
        region="DE",
        lawful_basis_recommendation="Legitimate Interest (GDPR Art. 6(1)(f)) for UX improvement",
        cookies_required=False,
        pii_stored=False,
        stored_data=["Aggregated friction metrics", "Federated model tensors", "Hashed API keys", "Hashed client IDs"],
        not_stored_data=["IP addresses", "Session IDs", "Raw click/scroll events", "Full URLs", "Typed text"],
        tdddg_banner_required=False,
    )


@app.post("/api/v1/aggregate")
async def aggregate(update: FederatedUpdate, bg: BackgroundTasks, project: Project = Depends(get_project)) -> dict[str, Any]:
    if not validate_client_id(update.client_id):
        raise HTTPException(status_code=400, detail="Invalid client_id")

    # Enforce opt-out (Germany-first)
    if aggregator.redis.exists(f"optout:{project.id}:{update.client_id}"):
        return {"status": "ignored", "reason": "opted_out"}

    should = await aggregator.add_update(project.id, update)
    if should:
        bg.add_task(aggregator.aggregate)

    # MVP: also record aggregated rage incidence count only (no selectors, no URLs).
    # MVP metric extraction: we derive a rage ratio from either legacy layers or v2 tensors.
    rage_ratio = 0.0
    if update.weight_delta.layers:
        rage_ratio = float(update.weight_delta.layers[0][0][0])
    elif update.weight_delta.tensors:
        arr = update.weight_delta.tensors[0].to_numpy()
        rage_ratio = float(arr.ravel()[0]) if arr.size else 0.0

    if TESTING and isinstance(db, InMemoryDatabase):
        db._metrics.append({"project_id": project.id, "metric_type": "rage", "recorded_at": datetime.now(timezone.utc), "aggregated_value": {"rage_ratio": rage_ratio, "samples": update.num_samples, "ts": update.timestamp}})
    else:
        assert db.pool
        async with db.pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO friction_metrics (project_id, metric_type, aggregated_value) VALUES ($1, $2, $3)",
                project.id,
                "rage",
                {"rage_ratio": rage_ratio, "samples": update.num_samples, "ts": update.timestamp},
            )

    return {"status": "received", "queued_updates": len(aggregator.pending)}


@app.get("/api/v1/dashboard/friction", response_model=FrictionMetrics)
async def dashboard_friction(time_range: str = "24h", project: Project = Depends(get_project)) -> FrictionMetrics:
    hours = _parse_time_range_to_hours(time_range)
    start = datetime.now(timezone.utc) - timedelta(hours=hours)

    if TESTING and isinstance(db, InMemoryDatabase):
        rows = [m for m in db._metrics if m["project_id"] == project.id and m["metric_type"] == "rage" and m["recorded_at"] >= start]
        values = [r["aggregated_value"] for r in rows]
    else:
        assert db.pool
        rows = await db.pool.fetch(
            """
            SELECT aggregated_value
            FROM friction_metrics
            WHERE project_id = $1 AND metric_type = 'rage' AND recorded_at >= $2
            ORDER BY recorded_at DESC
            LIMIT 2000
            """,
            project.id,
            start,
        )
        values = [r["aggregated_value"] for r in rows]

    rage_incidents = 0
    for v in values:
        rage_incidents += int(round(float(v.get("rage_ratio", 0.0)) * int(v.get("samples", 0))))

    friction_score = min((rage_incidents / 100.0) * 100.0, 100.0) if rage_incidents else 0.0

    return FrictionMetrics(
        overall_friction_score=round(friction_score, 2),
        rage_click_incidents=rage_incidents,
        top_rage_elements=[],
        hesitation_hotspots=[],
        confusion_patterns=[],
        time_range={"start": start.isoformat(), "end": datetime.now(timezone.utc).isoformat()},
    )


def _parse_time_range_to_hours(s: str) -> int:
    s = s.strip().lower()
    if s.endswith("h"):
        return max(1, int(s[:-1]))
    if s.endswith("d"):
        return max(1, int(s[:-1]) * 24)
    return 24
