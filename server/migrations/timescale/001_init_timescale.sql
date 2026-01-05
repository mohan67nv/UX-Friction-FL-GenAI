-- TimescaleDB init (runs on container init)

CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Hypertable for friction_events (if using Postgres for analytics).
-- This is a "future" table to migrate from SQLite hourly buckets.

CREATE TABLE IF NOT EXISTS friction_events_ts (
  time TIMESTAMPTZ NOT NULL,
  project_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  event_count INT NOT NULL DEFAULT 0,
  avg_intensity DOUBLE PRECISION,
  page_url_hash TEXT,
  top_element_hash TEXT,
  device_type TEXT,
  PRIMARY KEY (time, project_id, metric_type)
);

SELECT create_hypertable('friction_events_ts', 'time', if_not_exists => TRUE);

-- Continuous aggregate (hourly)
CREATE MATERIALIZED VIEW IF NOT EXISTS friction_events_hourly
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS hour,
  project_id,
  metric_type,
  SUM(event_count) AS total_events,
  AVG(avg_intensity) AS avg_intensity
FROM friction_events_ts
GROUP BY hour, project_id, metric_type;

-- Refresh policy
SELECT add_continuous_aggregate_policy('friction_events_hourly',
  start_offset => INTERVAL '7 days',
  end_offset => INTERVAL '10 minutes',
  schedule_interval => INTERVAL '10 minutes'
);
