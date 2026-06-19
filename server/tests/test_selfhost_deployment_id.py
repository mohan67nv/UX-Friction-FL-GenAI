from src.selfhost_config import load_config


def test_selfhost_config_has_deployment_id_default(tmp_path, monkeypatch):
    # Missing file => defaults
    monkeypatch.setenv("ZEROBANNER_CONFIG", str(tmp_path / "missing.yml"))
    cfg = load_config()
    assert hasattr(cfg.global_sync, "deployment_id")
