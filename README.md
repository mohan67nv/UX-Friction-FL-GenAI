# ZeroBanner (Workspace)

This repo contains:
- `server/`: FastAPI backend (dashboard APIs + SDK ingest)

Product name used in UI/demo: **ZeroBanner**.
- `dashboard/`: Next.js dashboard + marketing pages
- `client/`: Browser SDK (ONNX intent embedder runner)

## Quick start

1. Copy `env.example` → `.env` and adjust values.
2. Run:

```bash
docker-compose up --build
```

- API: http://localhost:8000/
- Dashboard: http://localhost:3000/

## UX Auditor (chat)

Dashboard page: `/app/auditor`

### Chat actions (UI buttons)

The UX Auditor response includes `actions[]` that render as buttons in the chat UI.
Implemented actions:
- `open_recommendations`: navigates to `/app/recommendations`
- `expand_time_range`: switches to `30d` and posts an assistant message prompting a re-ask
- `mark_top_recommendation_done`: calls the dashboard API to mark the highest-impact open recommendation as done

Action execution is implemented in:
- `dashboard/app/app/auditor/chatActions.ts`

### Chat history persistence

Chat messages are stored per project (no session replay, no cookies required for tracking).
Endpoints:
- `GET /dashboard/ux-auditor/history?project_id=...`
- `POST /dashboard/ux-auditor/append`
- `POST /dashboard/ux-auditor/ask`

## Semantic retrieval (Qdrant)

The UX Auditor uses semantic retrieval over privacy-safe, aggregated documents.
It can optionally use Qdrant if `QDRANT_URL` is configured.

### Collections

To avoid dimension conflicts, the system uses separate collections:

- Textual UX-auditor documents (RAG docs):
  - env: `QDRANT_TEXT_COLLECTION`
  - default: `ux_auditor_docs`

- Aggregated intent embedding summaries (from SDK ingest):
  - env: `QDRANT_INTENT_COLLECTION`
  - default: `intent_embeddings`

### Required env vars

- `QDRANT_URL` (e.g. `http://localhost:6333`)
- optional: `QDRANT_TEXT_COLLECTION`
- optional: `QDRANT_INTENT_COLLECTION`

## LLM providers (optional)

The UX Auditor can generate richer narrative answers via an optional LLM backend.
If no provider is configured, the system falls back to a deterministic heuristic mode.

### DeepSeek (recommended)

Set:
- `LLM_BACKEND=auto` (or `deepseek`)
- `DEEPSEEK_API_KEY=...`
- `DEEPSEEK_BASE_URL=https://api.deepseek.com`
- `DEEPSEEK_MODEL=deepseek-chat` (or `deepseek-reasoner`, `deepseek-coder`)

### Ollama (local)

Set:
- `LLM_BACKEND=ollama`
- `OLLAMA_URL=http://localhost:11434`
- `OLLAMA_MODEL=llama3.1:8b-instruct`

### OpenAI (optional)

Set:
- `LLM_BACKEND=openai`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-4o-mini`

Notes:
- Qdrant collection creation is non-destructive (existing data is not dropped).

## Interview demo (Docker)

1) Start the stack:

```bash
docker compose up -d --build
```

2) Seed demo data (creates demo user/org/project + recommendations + friction time series):

```bash
docker compose exec api python -m src.demo_harness
```

3) Login to the dashboard:
- http://localhost:3000/login

Use printed demo credentials.

4) Open demo pages:
- Overview: http://localhost:3000/app/overview
- Recommendations: http://localhost:3000/app/recommendations
- Auditor: http://localhost:3000/app/auditor

### Optional: simulate FL rounds

Set env vars in `.env`:

- `DEMO_FL_ROUNDS=3`
- `DEMO_FL_CLIENTS_PER_ROUND=10`
- `DP_EPSILON=1.0` (optional)

Then re-run:

```bash
docker compose exec api python -m src.demo_harness
```

## Tests

Backend:

```bash
python -m pytest -q
```

Dashboard:

```bash
pnpm -C dashboard lint
pnpm -C dashboard build
```
