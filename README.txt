PrivacyEdge Analytics |

Quick start:
1) Copy env.example -> .env and adjust values.
2) Run: docker-compose up --build
3) API: http://localhost:8000/
4) Dashboard: http://localhost:3000/

Notes:
- MVP is heuristics-only rage click detection.
- No cookies are set by the SDK.
- SDK uses a daily-rotating ephemeral client id (not a stable fingerprint).
