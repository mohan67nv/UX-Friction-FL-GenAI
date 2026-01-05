TimescaleDB migration path

- docker-compose.dev.yml runs timescaledb and executes SQL in this folder at container init.
- This adds:
  - friction_events_ts hypertable
  - friction_events_hourly continuous aggregate

The server currently uses SQLite-friendly friction_events hourly buckets.
Migration plan:
1) Switch DATABASE_URL to Postgres (postgresql://...)
2) Add a feature flag to write to friction_events_ts instead of SQLite hourly table.
3) Update analytics queries to use continuous aggregates.
