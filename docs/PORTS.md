# ZeroBanner Local Development Ports

**Port Configuration** (Updated to avoid conflicts with other projects)

## Service URLs

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| **Dashboard** | http://localhost:3001 | 3001 | Next.js frontend |
| **API** | http://localhost:8001 | 8001 | FastAPI backend |
| **PostgreSQL** | localhost:5433 | 5433 | Database |
| **Redis** | localhost:6380 | 6380 | Cache |
| **Qdrant** | http://localhost:6333 | 6333 | Vector DB |

## Quick Access

- **Login Page**: http://localhost:3001/login
- **Dashboard**: http://localhost:3001/app/overview
- **AI Auditor**: http://localhost:3001/app/auditor
- **API Docs**: http://localhost:8001/docs (FastAPI interactive docs)
- **API Health**: http://localhost:8001/health

## Demo Credentials

```
Email: demo@zerobanner.local
Password: DemoPassword123!
```

## Environment Variables

All configuration is in `.env` file. Key settings:

```bash
# API accessible from browser
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001

# Database (internal Docker network)
ZEROBANNER_DATABASE_URL=postgresql://zerobanner:zerobanner@postgres:5432/zerobanner

# CORS (allow dashboard access)
ZEROBANNER_CORS_ORIGINS=http://localhost:3001,http://localhost:8080
```

## Docker Commands

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f api
docker compose logs -f dashboard

# Stop all services
docker compose down

# Fresh restart (clear data)
docker compose down -v && docker compose up -d --build
```

## Port Conflict Resolution

If you see "port already in use" errors:

```bash
# Check what's using a port
lsof -i :3001  # Dashboard
lsof -i :8001  # API
lsof -i :5433  # PostgreSQL

# Kill process using port
kill -9 <PID>

# Or stop conflicting project
cd ../other-project && docker compose down
```

## Testing Connectivity

```bash
# Test API
curl http://localhost:8001/health

# Test Dashboard (should return HTML)
curl http://localhost:3001

# Test Database
psql -h localhost -p 5433 -U zerobanner -d zerobanner
# Password: zerobanner

# Test Redis
redis-cli -p 6380 ping
```

## Browser SDK Configuration

When creating test pages, use:

```html
<script src="http://localhost:8001/api/v1/sdk/client.js"></script>
<script>
  ZeroBanner.init({
    apiKey: 'YOUR_API_KEY',
    apiBaseUrl: 'http://localhost:8001'  // Note: 8001 not 8000!
  });
</script>
```

## Notes

- **Port 3000 & 8000**: Used by jobhunter project, so we use 3001 & 8001
- **Port 5432 & 6379**: May be used by system services or Supabase
- **Port 6333**: Qdrant default port, rarely conflicts
- **Internal Docker Network**: Services communicate via service names (postgres, redis, api) not localhost
