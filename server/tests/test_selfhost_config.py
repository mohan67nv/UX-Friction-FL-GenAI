from src.selfhost_config import load_config


def test_load_config_defaults_when_missing(tmp_path, monkeypatch):
    monkeypatch.setenv("ZEROBANNER_CONFIG", str(tmp_path / "missing.yml"))
    cfg = load_config()
    assert cfg.mode == "saas"
    assert cfg.global_sync.enabled is False
