from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import numpy as np
from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from . import crud
from .selfhost_config import load_config
from .global_sync import apply_downloaded_model, download_global_model, export_latest_model, upload_model_update
from .auth import create_access_token, get_current_user, verify_password
from .database import AsyncSessionLocal, GlobalModel, init_db, get_db
from .models_recommendations import Recommendation
from .schemas_recommendations import BenchmarksResponse, MarkDoneResponse, RecommendationView
from .schemas import (
    AuthResponse,
    CreateProjectRequest,
    CreateProjectResponse,
    DashboardOverview,
    LoginRequest,
    RegisterRequest,
)
from .schemas_keys import APIKeyView, CreateAPIKeyRequest, CreateAPIKeyResponse, RevokeAPIKeyResponse
from .rbac import require_permission
from .schemas_org import InviteMemberRequest, OrgMemberView
from .schemas_projects import UpdateProjectRequest

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


REDIS_URL = _env("REDIS_URL", "redis://localhost:6379/0")
CORS_ORIGINS = _env("CORS_ORIGINS", "*")

MAX_CLIENTS_PER_ROUND = int(os.getenv("MAX_CLIENTS_PER_ROUND", "100"))
AGGREGATION_INTERVAL_SECONDS = int(os.getenv("AGGREGATION_INTERVAL_SECONDS", "300"))

DP_EPSILON = float(os.getenv("DP_EPSILON", "0"))
DP_CLIP_NORM = float(os.getenv("DP_CLIP_NORM", "1.0"))

METRICS_RETENTION_DAYS = int(os.getenv("METRICS_RETENTION_DAYS", "90"))
OPTOUT_DEFAULT_DAYS = int(os.getenv("OPTOUT_DEFAULT_DAYS", "365"))

# ------------------------------
# Pydantic models (SDK endpoints)
# ------------------------------


from .weights import ModelWeights


class FederatedUpdate(BaseModel):
    client_id: str = Field(..., min_length=64, max_length=64)
    weight_delta: ModelWeights
    num_samples: int = Field(..., gt=0, le=50_000)
    timestamp: int


class OptOutRequest(BaseModel):
    client_id: str = Field(..., min_length=64, max_length=64)
    ttl_days: Optional[int] = Field(default=None, ge=1, le=3650)


# ------------------------------
# Federated aggregation (in-memory queue)
# ------------------------------


def validate_client_id(client_id: str) -> bool:
    return len(client_id) == 64 and all(c in "0123456789abcdef" for c in client_id)


def clip_update(delta: list[np.ndarray], clip_norm: float) -> list[np.ndarray]:
    if clip_norm <= 0:
        return delta
    squared = 0.0
    for d in delta:
        squared += float(np.sum(np.square(d)))
    norm = float(np.sqrt(squared))
    if norm <= clip_norm or norm == 0:
        return delta
    scale = clip_norm / norm
    return [d * scale for d in delta]


def add_dp_noise(delta: list[np.ndarray], epsilon: float, sensitivity: float) -> list[np.ndarray]:
    if epsilon <= 0:
        return delta
    scale = float(sensitivity / epsilon)
    return [d + np.random.laplace(0.0, scale, size=d.shape).astype(np.float32) for d in delta]


class _FakeRedis:
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


class FederatedAggregator:
    def __init__(self) -> None:
        self.redis = _FakeRedis() if os.getenv("TESTING", "0") == "1" else Redis.from_url(REDIS_URL)
        self.pending: list[tuple[str, FederatedUpdate]] = []

    def _verify_eligibility(self, project_id: str, client_id: str) -> bool:
        key = f"round:{project_id}:current:client:{client_id}"
        if self.redis.exists(key):
            return False
        self.redis.setex(key, AGGREGATION_INTERVAL_SECONDS, "1")
        return True

    async def add_update(self, project_id: str, update: FederatedUpdate) -> bool:
        if not self._verify_eligibility(project_id, update.client_id):
            return False
        self.pending.append((project_id, update))
        return len(self.pending) >= MAX_CLIENTS_PER_ROUND

    async def aggregate(self, db: AsyncSession) -> None:
        if not self.pending:
            return

        by_project: dict[str, list[FederatedUpdate]] = {}
        for pid, upd in self.pending:
            by_project.setdefault(pid, []).append(upd)

        for project_id, updates in by_project.items():
            # Load latest model weights (json) or init
            latest = await db.execute(
                crud.select_latest_model(project_id)
            )
            row = latest.first()
            if row:
                global_weights = ModelWeights.model_validate_json(row[0]).to_numpy()
                version = int(row[1])
            else:
                global_weights = [np.zeros((1, 1), dtype=np.float32)]
                version = 0

            total_samples = sum(u.num_samples for u in updates)
            weighted_sum = [np.zeros_like(w) for w in global_weights]

            for upd in updates:
                w = upd.num_samples / total_samples
                delta = upd.weight_delta.to_numpy()
                delta = clip_update(delta, DP_CLIP_NORM)
                delta = add_dp_noise(delta, DP_EPSILON, DP_CLIP_NORM) if DP_EPSILON > 0 else delta
                for i in range(min(len(weighted_sum), len(delta))):
                    weighted_sum[i] += w * delta[i]

            new_w = [global_weights[i] + weighted_sum[i] for i in range(len(global_weights))]
            mw = ModelWeights.from_numpy(new_w)

            db.add(
                GlobalModel(
                    project_id=project_id,
                    version=version + 1,
                    weights_json=mw.model_dump_json(),
                    num_contributors=len(updates),
                )
            )

        self.pending = []


aggregator = FederatedAggregator()


# ------------------------------
# App
# ------------------------------


cfg = load_config()

app = FastAPI(title="PrivacyEdge Analytics API", version="0.2.0")

# Global sync endpoints (used by SaaS global server)
from .routes_global_sync import router as global_sync_router

app.include_router(global_sync_router)

origins = [o.strip() for o in CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    await init_db()

    # NOTE: in tests, we avoid starting background loops.
    if os.getenv("TESTING", "0") == "1":
        return

    import asyncio

    async def _loop():
        while True:
            await asyncio.sleep(AGGREGATION_INTERVAL_SECONDS)
            async with AsyncSessionLocal() as db:
                await aggregator.aggregate(db)

    asyncio.create_task(_loop())

    # Weekly sync loop for collaborative self-hosted deployments
    async def _sync_loop():
        if cfg.mode != "self_hosted_collaborative" or not cfg.global_sync.enabled:
            return

        # weekly = 7 days, daily = 1 day
        freq = cfg.global_sync.frequency
        interval = 7 * 24 * 3600 if freq == "weekly" else 24 * 3600

        while True:
            await asyncio.sleep(interval)
            if cfg.offline_mode:
                continue

            async with AsyncSessionLocal() as db:
                from sqlalchemy import select

                rows = await db.execute(select(GlobalModel.project_id).distinct())
                for (project_id,) in rows.all():
                    weights_json, version = await export_latest_model(db, project_id)
                    if weights_json and version is not None:
                        await upload_model_update(
                            cfg=cfg,
                            project_id=project_id,
                            weights_json=weights_json,
                            version=version,
                        )
                    remote = await download_global_model(cfg=cfg, project_id=project_id)
                    if remote:
                        await apply_downloaded_model(db, project_id, remote)

    asyncio.create_task(_sync_loop())


@app.get("/")
async def health() -> dict[str, Any]:
    return {"status": "healthy", "ts": datetime.now(timezone.utc).isoformat(), "version": "0.2.0"}


@app.get("/api/v1/compliance/info")
async def compliance_info() -> dict[str, Any]:
    return {
        "region": "DE",
        "lawful_basis_recommendation": "Legitimate Interest (GDPR Art. 6(1)(f)) for UX improvement",
        "cookies_required": False,
        "pii_stored": False,
        "stored_data": ["Aggregated friction metrics", "Federated model tensors", "API key hashes"],
        "not_stored_data": ["IP addresses", "Session IDs", "Raw click/scroll events", "Full URLs", "Typed text"],
        "tdddg_banner_required": False,
    }


# ------------------------------
# Dashboard auth (JWT)
# ------------------------------


@app.post("/auth/register", response_model=AuthResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    existing = await crud.get_user_by_email(db, body.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = await crud.create_user(db, body.email, body.password, body.name)

    # Create default org if provided
    if body.organization_name:
        await crud.create_org_with_owner(db, user.id, body.organization_name)

    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, user={"id": user.id, "email": user.email, "name": user.name})


@app.post("/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    user = await crud.get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id, user.email)
    return AuthResponse(access_token=token, user={"id": user.id, "email": user.email, "name": user.name})


@app.get("/me")
async def me(user: dict = Depends(get_current_user)) -> dict:
    return user


@app.get("/dashboard/orgs")
async def dashboard_orgs(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[dict]:
    orgs = await crud.list_orgs_for_user(db, user["sub"])  # type: ignore[index]
    return [{"id": o.id, "name": o.name, "slug": o.slug, "plan": o.plan} for o in orgs]


@app.get("/dashboard/orgs/{org_id}/members", response_model=list[OrgMemberView])
async def org_members(org_id: str, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[OrgMemberView]:
    role = await crud.get_user_role_in_org(db, user["sub"], org_id)  # type: ignore[index]
    require_permission(role, "manage_members")

    members = await crud.list_org_members(db, org_id)
    return [OrgMemberView(user_id=uid, email=email, role=r) for (uid, email, r) in members]


@app.post("/dashboard/orgs/{org_id}/members", response_model=list[OrgMemberView])
async def org_add_member(
    org_id: str,
    body: InviteMemberRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[OrgMemberView]:
    role = await crud.get_user_role_in_org(db, user["sub"], org_id)  # type: ignore[index]
    require_permission(role, "manage_members")

    # MVP: "invite" requires the user already exists.
    u = await crud.get_user_by_email(db, body.email)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    await crud.add_org_member(db, org_id, u.id, body.role)
    members = await crud.list_org_members(db, org_id)
    return [OrgMemberView(user_id=uid, email=email, role=r) for (uid, email, r) in members]


@app.get("/dashboard/projects")
async def dashboard_projects(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[dict]:
    projects = await crud.list_projects_for_user(db, user["sub"])  # type: ignore[index]
    return [
        {
            "id": p.id,
            "name": p.name,
            "domain": p.domain,
            "privacy_mode": p.privacy_mode,
            "created_at": p.created_at.isoformat(),
        }
        for p in projects
    ]


@app.post("/dashboard/projects", response_model=CreateProjectResponse)
async def dashboard_create_project(
    body: CreateProjectRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CreateProjectResponse:
    # Require membership; only owner/admin can create projects
    orgs = await crud.list_orgs_for_user(db, user["sub"])  # type: ignore[index]
    if not any(o.id == body.organization_id for o in orgs):
        raise HTTPException(status_code=403, detail="No access to organization")

    # NOTE: for MVP, assume creator is owner/admin in that org; RBAC per org endpoint coming next.
    project, api_key = await crud.create_project(db, body.organization_id, body.name, body.domain, body.privacy_mode)
    return CreateProjectResponse(
        project_id=project.id,
        api_key=api_key,
        message="Save this API key now; it will not be shown again.",
    )


@app.patch("/dashboard/projects/{project_id}")
async def dashboard_update_project(
    project_id: str,
    body: UpdateProjectRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    try:
        role = await crud.require_project_access(db, user["sub"], project_id)  # type: ignore[index]
    except PermissionError:
        raise HTTPException(status_code=403, detail="No access to project")

    require_permission(role, "write")

    await crud.update_project(
        db,
        project_id,
        name=body.name,
        domain=body.domain,
        privacy_mode=body.privacy_mode,
        is_active=body.is_active,
    )

    return {"status": "ok"}


@app.get("/dashboard/projects/{project_id}/api-keys", response_model=list[APIKeyView])
async def dashboard_list_api_keys(
    project_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[APIKeyView]:
    try:
        role = await crud.require_project_access(db, user["sub"], project_id)  # type: ignore[index]
    except PermissionError:
        raise HTTPException(status_code=403, detail="No access to project")

    require_permission(role, "manage_keys")

    keys = await crud.list_api_keys(db, project_id)
    return [
        APIKeyView(
            id=k.id,
            key_prefix=k.key_prefix,
            name=k.name,
            created_at=k.created_at.isoformat(),
            last_used_at=k.last_used_at.isoformat() if k.last_used_at else None,
        )
        for k in keys
    ]


@app.post("/dashboard/projects/{project_id}/api-keys", response_model=CreateAPIKeyResponse)
async def dashboard_create_api_key(
    project_id: str,
    body: CreateAPIKeyRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CreateAPIKeyResponse:
    try:
        role = await crud.require_project_access(db, user["sub"], project_id)  # type: ignore[index]
    except PermissionError:
        raise HTTPException(status_code=403, detail="No access to project")

    require_permission(role, "manage_keys")

    api_key = await crud.create_api_key(db, project_id, name=body.name or "Key")
    keys = await crud.list_api_keys(db, project_id)
    k = keys[0]
    return CreateAPIKeyResponse(
        api_key=api_key,
        key=APIKeyView(
            id=k.id,
            key_prefix=k.key_prefix,
            name=k.name,
            created_at=k.created_at.isoformat(),
            last_used_at=k.last_used_at.isoformat() if k.last_used_at else None,
        ),
    )


@app.post("/dashboard/projects/{project_id}/api-keys/{key_id}/revoke", response_model=RevokeAPIKeyResponse)
async def dashboard_revoke_api_key(
    project_id: str,
    key_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RevokeAPIKeyResponse:
    try:
        role = await crud.require_project_access(db, user["sub"], project_id)  # type: ignore[index]
    except PermissionError:
        raise HTTPException(status_code=403, detail="No access to project")

    require_permission(role, "manage_keys")
    await crud.revoke_api_key(db, key_id, project_id)
    return RevokeAPIKeyResponse()


@app.get("/dashboard/recommendations", response_model=list[RecommendationView])
async def dashboard_recommendations(
    project_id: str,
    lang: str = "de",
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[RecommendationView]:
    try:
        await crud.require_project_access(db, user["sub"], project_id)  # type: ignore[index]
    except PermissionError:
        raise HTTPException(status_code=403, detail="No access to project")

    from sqlalchemy import select

    rows = await db.execute(
        select(Recommendation)
        .where(Recommendation.project_id == project_id)
        .order_by(Recommendation.impact_month_eur.desc())
    )
    recos = list(rows.scalars().all())
    return [
        RecommendationView(
            id=r.id,
            project_id=r.project_id,
            priority=r.priority,
            status=r.status,
            title=(r.title_en if lang == "en" and r.title_en else r.title),
            metric_type=r.metric_type,
            what_text=(r.what_text_en if lang == "en" and r.what_text_en else r.what_text),
            why_text=(r.why_text_en if lang == "en" and r.why_text_en else r.why_text),
            who_text=(r.who_text_en if lang == "en" and r.who_text_en else r.who_text),
            confidence=r.confidence,
            incidents_week=r.incidents_week,
            cost_week_eur=r.cost_week_eur,
            impact_month_eur=r.impact_month_eur,
            fix_summary=(r.fix_summary_en if lang == "en" and r.fix_summary_en else r.fix_summary),
            fix_code=(r.fix_code_en if lang == "en" and r.fix_code_en else r.fix_code),
            effort_minutes=r.effort_minutes,
            created_at=r.created_at.isoformat(),
        )
        for r in recos
    ]


@app.get("/dashboard/recommendations/top", response_model=RecommendationView)
async def dashboard_recommendations_top(
    project_id: str,
    lang: str = "de",
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RecommendationView:
    try:
        await crud.require_project_access(db, user["sub"], project_id)  # type: ignore[index]
    except PermissionError:
        raise HTTPException(status_code=403, detail="No access to project")

    from sqlalchemy import select

    row = await db.execute(
        select(Recommendation)
        .where(Recommendation.project_id == project_id, Recommendation.status == "open")
        .order_by(Recommendation.impact_month_eur.desc())
        .limit(1)
    )
    r = row.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="No recommendations")

    return RecommendationView(
        id=r.id,
        project_id=r.project_id,
        priority=r.priority,
        status=r.status,
        title=(r.title_en if lang == "en" and r.title_en else r.title),
        metric_type=r.metric_type,
        what_text=(r.what_text_en if lang == "en" and r.what_text_en else r.what_text),
        why_text=(r.why_text_en if lang == "en" and r.why_text_en else r.why_text),
        who_text=(r.who_text_en if lang == "en" and r.who_text_en else r.who_text),
        confidence=r.confidence,
        incidents_week=r.incidents_week,
        cost_week_eur=r.cost_week_eur,
        impact_month_eur=r.impact_month_eur,
        fix_summary=(r.fix_summary_en if lang == "en" and r.fix_summary_en else r.fix_summary),
        fix_code=(r.fix_code_en if lang == "en" and r.fix_code_en else r.fix_code),
        effort_minutes=r.effort_minutes,
        created_at=r.created_at.isoformat(),
    )


@app.post("/dashboard/recommendations/{rec_id}/done", response_model=MarkDoneResponse)
async def dashboard_recommendations_done(
    rec_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MarkDoneResponse:
    from sqlalchemy import update

    # NOTE: we keep it simple: mark done if user belongs to the project org.
    # Fetch recommendation to get project_id
    from sqlalchemy import select

    row = await db.execute(select(Recommendation).where(Recommendation.id == rec_id).limit(1))
    rec = row.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Not found")

    try:
        role = await crud.require_project_access(db, user["sub"], rec.project_id)  # type: ignore[index]
    except PermissionError:
        raise HTTPException(status_code=403, detail="No access")

    require_permission(role, "write")

    await db.execute(update(Recommendation).where(Recommendation.id == rec_id).values(status="done"))
    return MarkDoneResponse()


@app.get("/dashboard/benchmarks", response_model=BenchmarksResponse)
async def dashboard_benchmarks(
    project_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BenchmarksResponse:
    try:
        await crud.require_project_access(db, user["sub"], project_id)  # type: ignore[index]
    except PermissionError:
        raise HTTPException(status_code=403, detail="No access")

    # Simulated (anonymous) German e-commerce benchmarks for demo.
    return BenchmarksResponse(
        ux_health_score=73,
        industry_score=68,
        rage_rate_per_1k=23.4,
        industry_rage_rate_per_1k=18.2,
        hesitation_rate_pct=8.9,
        industry_hesitation_rate_pct=6.4,
        cart_abandonment_pct=67.3,
        industry_cart_abandonment_pct=61.2,
        notes=[
            "Demo benchmarks are simulated until we have sufficient anonymous network data.",
            "Germany-first: comparisons will be DACH / DE e-commerce by category.",
        ],
    )


@app.get("/dashboard/analytics/overview", response_model=DashboardOverview)
async def dashboard_overview(
    project_id: str,
    time_range: str = "24h",
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardOverview:
    try:
        await crud.require_project_access(db, user["sub"], project_id)  # type: ignore[index]
    except PermissionError:
        raise HTTPException(status_code=403, detail="No access to project")

    hours = parse_time_range(time_range)
    series = await crud.query_timeseries(db, project_id, hours)

    counts = {"rage": 0, "hesitation": 0, "confusion": 0, "dead_end": 0}
    for p in series:
        counts[p["metric_type"]] = counts.get(p["metric_type"], 0) + p["count"]

    total = sum(counts.values())
    # Simple friction score: weighted sum mapped to 0-100 (lower better). Tweak later.
    weighted = counts["rage"] * 0.4 + counts["hesitation"] * 0.3 + counts["confusion"] * 0.3 + counts["dead_end"] * 0.2
    friction_score = 0.0
    if total > 0:
        friction_score = min((weighted / max(1.0, total)) * 100.0, 100.0)

    return DashboardOverview(
        friction_score=round(friction_score, 2),
        rage_count=counts["rage"],
        hesitation_count=counts["hesitation"],
        confusion_count=counts["confusion"],
        dead_end_count=counts["dead_end"],
        series=series,
    )


def parse_time_range(s: str) -> int:
    s = s.strip().lower()
    if s.endswith("h"):
        return max(1, int(s[:-1]))
    if s.endswith("d"):
        return max(1, int(s[:-1]) * 24)
    return 24


# ------------------------------
# SDK endpoints (API key auth)
# ------------------------------


async def get_project_id_from_api_key(x_api_key: str = Header(default=""), db: AsyncSession = Depends(get_db)) -> str:
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    pid = await crud.validate_api_key(db, x_api_key)
    if not pid:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return pid


@app.get("/api/v1/model/download", response_model=ModelWeights)
async def model_download(project_id: str = Depends(get_project_id_from_api_key), db: AsyncSession = Depends(get_db)) -> ModelWeights:
    res = await db.execute(crud.select_latest_model(project_id))
    row = res.first()
    if not row:
        return ModelWeights.from_numpy([np.zeros((1, 1), dtype=np.float32)])
    return ModelWeights.model_validate_json(row[0])


@app.get("/api/v1/model/foundation.onnx")
async def model_foundation_onnx() -> Any:
    """Serve the foundation ONNX model artifact if present.

    For SaaS mode, you can bake this into the API container or host on CDN.
    For self-host, ship the file alongside the deployment.
    """

    from fastapi.responses import FileResponse

    path = os.getenv("FOUNDATION_MODEL_ONNX_PATH", "ml-training/foundation_model.onnx")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Foundation model not available")
    return FileResponse(path, media_type="application/octet-stream")


@app.post("/api/v1/privacy/optout")
async def privacy_optout(
    body: OptOutRequest,
    project_id: str = Depends(get_project_id_from_api_key),
) -> dict[str, Any]:
    if not validate_client_id(body.client_id):
        raise HTTPException(status_code=400, detail="Invalid client_id")

    ttl_days = body.ttl_days or OPTOUT_DEFAULT_DAYS
    ttl_seconds = int(ttl_days * 24 * 3600)
    aggregator.redis.setex(f"optout:{project_id}:{body.client_id}", ttl_seconds, "1")
    return {"status": "ok", "ttl_days": ttl_days}


@app.get("/api/v1/dashboard/friction")
async def api_key_dashboard_friction(
    time_range: str = "24h",
    project_id: str = Depends(get_project_id_from_api_key),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    hours = parse_time_range(time_range)
    series = await crud.query_timeseries(db, project_id, hours)

    rage = sum(p["count"] for p in series if p["metric_type"] == "rage")
    hesitation = sum(p["count"] for p in series if p["metric_type"] == "hesitation")
    confusion = sum(p["count"] for p in series if p["metric_type"] == "confusion")
    dead_end = sum(p["count"] for p in series if p["metric_type"] == "dead_end")

    total = rage + hesitation + confusion + dead_end
    weighted = rage * 0.4 + hesitation * 0.3 + confusion * 0.3 + dead_end * 0.2
    friction = min((weighted / max(1.0, total)) * 100.0, 100.0) if total else 0.0

    return {
        "overall_friction_score": round(friction, 2),
        "rage_click_incidents": int(rage),
        "top_rage_elements": [],
        "hesitation_hotspots": [],
        "confusion_patterns": [],
        "time_range": {
            "hours": hours,
        },
    }


@app.post("/api/v1/aggregate")
async def aggregate(
    update: FederatedUpdate,
    bg: BackgroundTasks,
    project_id: str = Depends(get_project_id_from_api_key),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    if not validate_client_id(update.client_id):
        raise HTTPException(status_code=400, detail="Invalid client_id")

    if aggregator.redis.exists(f"optout:{project_id}:{update.client_id}"):
        return {"status": "ignored", "reason": "opted_out"}

    # Queue for FL aggregation
    should = await aggregator.add_update(project_id, update)
    if should:
        bg.add_task(aggregator.aggregate, db)

    # Store aggregated friction event (Germany-first: only counts)
    rage_ratio = 0.0
    if update.weight_delta.tensors:
        arr = update.weight_delta.tensors[0].to_numpy()
        rage_ratio = float(arr.ravel()[0]) if arr.size else 0.0
    elif update.weight_delta.layers:
        rage_ratio = float(update.weight_delta.layers[0][0][0])

    # For now interpret as "rage" signal. Later: send class vector.
    incidents = int(round(rage_ratio * update.num_samples))
    await crud.increment_friction_event(db, project_id, "rage", update.timestamp, incidents, intensity=rage_ratio)

    return {"status": "received"}
