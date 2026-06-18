# PrivacyEdge

> Privacy-first UX analytics platform using Federated Learning and Differential Privacy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

## Overview

PrivacyEdge is a GDPR-compliant UX analytics platform that detects user friction patterns (rage clicks, hesitation, confusion) **without collecting personally identifiable information**. It uses **Federated Learning** to train models on-device while keeping user data completely local.

### Key Features

- **🔒 Privacy-First**: No PII collection, no cookies, no fingerprinting
- **🧠 Federated Learning**: Training happens in the browser; only model updates reach the server
- **🎯 99%+ Accuracy**: Two trained ML models (neural network + Transformer)
- **🚀 On-Device ML**: ONNX Runtime for browser-based inference
- **🤖 AI-Powered Insights**: RAG pipeline with multi-LLM support
- **✅ GDPR Compliant**: Differential privacy with configurable ε

## Architecture

```
┌─────────────────┐
│   Browser       │  ← On-device ML inference (ONNX)
│  (Client SDK)   │  ← Local training, no data leaves device
└────────┬────────┘
         │ Model updates only (DP noise applied)
         ↓
┌─────────────────┐
│  FastAPI Server │  ← Federated aggregation
│  (Python)       │  ← Differential privacy
└────────┬────────┘
         │ Aggregated insights
         ↓
┌─────────────────┐
│  Next.js        │  ← Dashboard & AI Auditor
│  Dashboard      │  ← Recommendations
└─────────────────┘
```

## Quick Start

### Prerequisites

- Docker & Docker Compose (recommended)
- **OR** Python 3.11+, Node.js 20+, pnpm 9+

### Using Docker (Recommended)

```bash
# 1. Clone and configure
git clone <your-repo-url>
cd PrivacyEdge
cp env.example .env

# 2. Start all services
docker compose up -d --build

# 3. Seed demo data
docker compose exec api python -m src.demo_harness

# 4. Access the application
# Dashboard: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Local Development

See [docs/SETUP.md](docs/SETUP.md) for detailed local development instructions.

## Project Structure

```
.
├── client/           # Browser SDK (TypeScript + ONNX Runtime)
├── server/           # FastAPI backend + FL aggregation
├── dashboard/        # Next.js 15 dashboard
├── ml-training/      # Model training scripts
└── docker-compose.yml
```

## Technology Stack

**Backend**: Python 3.11, FastAPI, SQLAlchemy (async), Redis, PostgreSQL, TimescaleDB

**Frontend**: TypeScript, Next.js 15, React 19, Recharts

**ML/AI**: PyTorch, ONNX Runtime, Transformers, LangChain, Haystack, Qdrant

**DevOps**: Docker, Docker Compose

## Core Components

### Federated Learning

- **Client**: [client/src/index.ts](client/src/index.ts) - Browser-side training and model updates
- **Server**: [server/src/app.py](server/src/app.py) - Weighted aggregation with differential privacy
- **Sync**: [server/src/global_sync.py](server/src/global_sync.py) - Cross-deployment model sharing

### ML Models

- **Foundation Model**: 8-input neural network (99.95% accuracy)
- **Intent Embedder**: Transformer with self-attention (99.90% accuracy)
- **Format**: ONNX (2-20 KB, browser-ready)
- **Training**: [ml-training/](ml-training/)

### Privacy Engineering

- **Differential Privacy**: Gradient clipping + Laplace noise (configurable ε)
- **Zero PII**: No cookies, no localStorage, ephemeral client IDs
- **Compliance**: GDPR Article 4(1) compliant by design

### AI/RAG Pipeline

- **Vector Search**: Qdrant + sentence-transformers
- **LLM Support**: OpenAI GPT-4, DeepSeek, Ollama (self-hosted)
- **Context**: Semantic retrieval over aggregated metrics

## Environment Variables

Key configuration (see `env.example` for complete list):

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/db

# Privacy Settings
DP_EPSILON=2.0              # Privacy budget (lower = more privacy)
DP_CLIP_NORM=1.0            # Gradient clipping threshold

# LLM (Optional)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Vector Store (Optional)
QDRANT_URL=http://localhost:6333
```

## Testing

```bash
cd server
pytest tests/ -v --cov=src
```

19 test files covering federated aggregation, model merging, RAG pipeline, and API endpoints.

## Development

### Training ML Models

```bash
cd ml-training

# Option 1: Docker (easiest)
docker run --rm -v "$(pwd):/work" -w /work python:3.11-slim bash -c \
  "pip install -q numpy torch onnx onnxscript && \
   python generate_synthetic_data.py && \
   python train_foundation_model.py && \
   python train_intent_embedder.py"

# Option 2: Local (requires Python packages)
pip install numpy torch onnx onnxscript
python generate_synthetic_data.py      # 30 seconds
python train_foundation_model.py       # 2-3 minutes, 99.95% accuracy
python train_intent_embedder.py        # 2-3 minutes, 99.90% accuracy
```

### Running Locally

**Backend**:
```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

**Frontend**:
```bash
cd dashboard
pnpm install && pnpm dev
```

**Client SDK**:
```bash
cd client
pnpm install && pnpm dev
```

## API Documentation

Interactive API docs available at: http://localhost:8000/docs (Swagger UI)

## Deployment

### Docker Compose (Production)

```bash
docker compose -f docker-compose.yml up -d
```

### Manual Deployment

1. Configure production environment variables
2. Set up PostgreSQL with TimescaleDB
3. Configure Redis for persistence
4. Deploy behind reverse proxy (nginx/Caddy) with SSL/TLS
5. Set up monitoring and backups

## License

MIT License - see [LICENSE](LICENSE) file for details

## Documentation

- **[Setup Guide](docs/SETUP.md)**: Detailed setup and development guide
- **[Python Environment](docs/VENV_SETUP.md)**: Virtual environment setup
- **[Project Overview](docs/PROJECT_REALITY_CHECK.md)**: What's built and how to use it
- **[Summary](docs/FINAL_SUMMARY.md)**: Quick reference guide
- **API Docs**: http://localhost:8000/docs (when running)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

This project implements:
- Differential privacy (ε-DP with configurable privacy budget)
- Zero PII collection
- Ephemeral data storage (200ms TTL)
- GDPR Article 4(1) compliance

For security issues, please email: security@example.com

## Acknowledgments

- Built with PyTorch, FastAPI, and Next.js
- Inspired by privacy-first initiatives like Apple's Private Federated Learning
- ONNX Runtime for cross-platform ML inference

---

**Status**: Research MVP with core FL implementation complete. See [docs/](docs/) for detailed documentation.
