"""Initialize or patch zerobanner-setup.yml with a stable deployment_id.

Usage:
  python server/scripts/init_selfhost_config.py zerobanner-setup.yml

This is for self-hosted deployments so global sync can distinguish instances.
"""

from __future__ import annotations

import secrets
import sys
from pathlib import Path

import yaml


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("zerobanner-setup.yml")
    if not path.exists():
        raise SystemExit(f"Config not found: {path}")

    data = yaml.safe_load(path.read_text("utf-8")) or {}
    gs = data.get("global_sync") or {}

    # Only add if missing
    if not gs.get("deployment_id"):
        gs["deployment_id"] = secrets.token_hex(16)
        data["global_sync"] = gs
        path.write_text(yaml.safe_dump(data, sort_keys=False), "utf-8")
        print(f"Added global_sync.deployment_id to {path}")
    else:
        print("deployment_id already set")


if __name__ == "__main__":
    main()
