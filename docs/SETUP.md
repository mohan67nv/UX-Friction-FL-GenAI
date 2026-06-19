# Setup Guide

## Prerequisites

- **Python 3.11+** - For backend and ML training
- **Node.js 20+** - For frontend development
- **Docker & Docker Compose** - Recommended for quick start
- **pnpm 9+** - For frontend package management

## Quick Start (Docker - Recommended)

The fastest way to run the entire stack:

```bash
# 1. Clone and navigate
git clone <your-repo-url>
cd ZeroBanner-FL-GenAI

# 2. Copy environment configuration
cp env.example .env

# 3. Start all services (API, Dashboard, DB, Redis, Qdrant)
docker compose up -d --build

# 4. Seed demo data and create test user
docker compose exec api python -m src.demo_harness

# 5. Access the application
# Dashboard: http://localhost:3000
# API Docs: http://localhost:8000/docs
# Login with credentials printed by demo_harness
```

## Local Development Setup

### 1. Generate ML Models (First Time Only)

Before running the application, generate the trained models:

```bash
# Quick setup script (recommended)
./setup_models.sh

# OR manually:
cd ml-training
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python generate_synthetic_data.py
python train_foundation_model.py
python train_intent_embedder.py
```

This will create:
- `foundation_model.onnx` - UX friction detection model
- `intent_embedder.onnx` - Transformer-based intent embedder
- `synthetic_ux_dataset.json` - Training data (10,000 samples)

### 2. Backend Setup (Python/FastAPI)

```bash
cd server

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ../.env.example ../.env
# Edit .env with your settings (optional for dev)

# Initialize database
python -m src.database  # Creates tables

# Run development server
uvicorn src.main:app --reload --port 8000
```

API will be available at: http://localhost:8000

### 3. Dashboard Setup (Next.js/React)

```bash
cd dashboard

# Install dependencies
pnpm install
# OR: npm install

# Run development server
pnpm dev
# OR: npm run dev
```

Dashboard will be available at: http://localhost:3000

### 4. Client SDK Development (TypeScript)

```bash
cd client

# Install dependencies
pnpm install

# Build in watch mode
pnpm dev

# Run tests
pnpm test
```

## Running Tests

### Backend Tests

```bash
cd server
source .venv/bin/activate

# Install test dependencies
pip install -r requirements-dev.txt

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=src --cov-report=html

# Run specific test file
pytest tests/test_api.py -v
```

### Frontend Tests

```bash
cd client
pnpm test
```

## Environment Variables

Key environment variables (see `env.example` for complete list):

### Backend (Server)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/dbname
# OR for dev: sqlite+aiosqlite:///./dev.db

# Redis
REDIS_URL=redis://localhost:6379/0

# Authentication
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256

# Privacy Settings
DP_EPSILON=2.0          # Differential privacy budget
DP_CLIP_NORM=1.0        # Gradient clipping threshold

# LLM Backends (Optional)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OLLAMA_BASE_URL=http://localhost:11434

# Vector Store (Optional)
QDRANT_URL=http://localhost:6333
```

### Frontend (Dashboard)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Docker Services

The `docker-compose.yml` includes:

- **api** - FastAPI backend (port 8000)
- **dashboard** - Next.js frontend (port 3000)
- **db** - PostgreSQL 16 with TimescaleDB (port 5432)
- **redis** - Redis 7 (port 6379)
- **qdrant** - Vector database (port 6333)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up -d --build
```

## Database Migrations

```bash
cd server

# Apply TimescaleDB migrations (if using PostgreSQL)
psql $DATABASE_URL < migrations/timescale/001_hypertable.sql
```

## Troubleshooting

### "No module named pytest"
```bash
cd server
pip install -r requirements-dev.txt
```

### "ONNX models not found"
```bash
./setup_models.sh
```

### "Port already in use"
```bash
# Check what's using the port
lsof -i :8000  # or :3000

# Stop the service or change ports in docker-compose.yml
```

### Redis connection errors
```bash
# Ensure Redis is running
docker compose ps redis

# Or install locally
sudo apt install redis-server  # Ubuntu/Debian
brew install redis             # macOS
```

## Development Workflow

1. **Start services**: `docker compose up -d db redis qdrant`
2. **Run backend**: `cd server && uvicorn src.main:app --reload`
3. **Run frontend**: `cd dashboard && pnpm dev`
4. **Make changes**: Edit code, auto-reload handles the rest
5. **Run tests**: `pytest tests/` in server directory
6. **Commit**: `git add . && git commit -m "feat: your feature"`

## Production Deployment

### Using Docker

```bash
# Build production images
docker compose -f docker-compose.yml build

# Deploy with production settings
docker compose -f docker-compose.yml up -d
```

### Manual Deployment

1. Set production environment variables
2. Use PostgreSQL (not SQLite)
3. Configure Redis for persistence
4. Enable HTTPS/TLS
5. Set up proper secrets management
6. Configure backup strategy

## Additional Resources

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **README.md**: Comprehensive project overview
- **FEDERATED_LEARNING_IMPLEMENTATION.md**: Deep dive into FL architecture
- **EMPLOYER_REVIEW_ASSESSMENT.md**: Code quality assessment

## Getting Help

If you encounter issues:

1. Check the logs: `docker compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all dependencies are installed
4. Check that ports 3000, 8000, 5432, 6379, 6333 are available

## Next Steps

After setup:

1. ✅ Generate ML models (`./setup_models.sh`)
2. ✅ Start development environment
3. ✅ Run tests to verify setup
4. ✅ Explore the dashboard at http://localhost:3000
5. ✅ Review API docs at http://localhost:8000/docs
6. ✅ Try the UX Auditor (AI chat interface)
7. ✅ Check out the federated learning workflow

---

**Questions or Issues?** Open an issue on GitHub or check the documentation files.
