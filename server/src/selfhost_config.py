from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

try:
    import yaml
except Exception:  # pragma: no cover
    yaml = None  # type: ignore



@dataclass
class GlobalSync:
    enabled: bool
    frequency: str
    endpoint: str
    api_key: str
    deployment_id: str


@dataclass
class Privacy:
    dp_enabled: bool
    epsilon: float


@dataclass
class SelfHostConfig:
    deployment_name: str
    mode: str
    global_sync: GlobalSync
    privacy: Privacy
    offline_mode: bool
    auto_reconnect: bool


def load_config(path: str | None = None) -> SelfHostConfig:
    path = path or os.getenv("ZEROBANNER_CONFIG", "zerobanner-setup.yml")
    if not os.path.exists(path):
        # Default: SaaS-like behavior (no global sync from this instance)
        return SelfHostConfig(
            deployment_name="ZeroBanner",
            mode="saas",
            global_sync=GlobalSync(enabled=False, frequency="weekly", endpoint="", api_key="", deployment_id=""),
            privacy=Privacy(dp_enabled=True, epsilon=1.0),
            offline_mode=False,
            auto_reconnect=True,
        )

    if yaml is None:
        raise RuntimeError("PyYAML not installed; install server requirements")

    with open(path, "r", encoding="utf-8") as f:
        data: dict[str, Any] = yaml.safe_load(f) or {}

    gs = data.get("global_sync") or {}
    pr = (data.get("privacy") or {}).get("differential_privacy") or {}
    em = data.get("emergency_controls") or {}

    return SelfHostConfig(
        deployment_name=str(data.get("deployment_name", "ZeroBanner Self-Hosted")),
        mode=str(data.get("mode", "self_hosted_isolated")),
        global_sync=GlobalSync(
            enabled=bool(gs.get("enabled", False)),
            frequency=str(gs.get("frequency", "weekly")),
            endpoint=str(gs.get("endpoint", "")),
            api_key=str(gs.get("api_key", "")),
            deployment_id=str(gs.get("deployment_id", "")),
        ),
        privacy=Privacy(
            dp_enabled=bool(pr.get("enabled", True)),
            epsilon=float(pr.get("epsilon", 1.0)),
        ),
        offline_mode=bool(em.get("offline_mode", False)),
        auto_reconnect=bool(em.get("auto_reconnect", True)),
    )
