# 🚀 Supabase Migration Guide - Production-Ready Setup

**Migration Goal:** Move from local Docker PostgreSQL to Supabase for reliability, security, and observability

**Timeline:** 1-2 days  
**Downtime:** None (parallel migration, then switch)

---

## 📊 **Why Migrate to Supabase?**

### **Current Setup (Local Docker) vs Supabase**

| Feature | Current (Local Docker) | Supabase |
|---------|------------------------|----------|
| **Database Location** | Your laptop disk | AWS (US) / EU cloud |
| **Data Backup** | ❌ None | ✅ Automatic (point-in-time recovery) |
| **High Availability** | ❌ Single machine | ✅ Multi-AZ redundancy |
| **Disaster Recovery** | ❌ If disk fails = data lost | ✅ 7-day backup retention |
| **Scalability** | ❌ Limited to laptop RAM/CPU | ✅ Auto-scale to 10K+ concurrent |
| **Monitoring** | ❌ Manual logs | ✅ Built-in dashboard, alerts |
| **Security** | ⚠️ Local firewall only | ✅ SSL, row-level security, audit logs |
| **Authentication** | ⚠️ Custom (gaps) | ✅ Enterprise-grade (OAuth, 2FA, email) |
| **Cost** | $0 (but risky) | $0-$25/month (safe) |
| **Uptime** | ⚠️ Only when laptop on | ✅ 99.9% SLA |

---

## 🎯 **What We'll Move to Supabase**

### **Phase 1: Database Only (Day 1)**
```
✅ PostgreSQL → Supabase PostgreSQL
✅ Users, Organizations, Projects, API Keys
✅ Friction events, analytics data
✅ UX Auditor chat history
✅ Keep Redis + Qdrant local (for now)
```

### **Phase 2: Authentication (Day 2)**
```
✅ JWT authentication → Supabase Auth
✅ Email/password login
✅ Google OAuth (built-in)
✅ GitHub OAuth (built-in)
✅ Email verification (automatic)
✅ Password reset (automatic)
✅ Row-level security (RLS)
```

### **Phase 3: Full Production (Week 2)**
```
✅ Redis → Upstash Redis (serverless)
✅ Qdrant → Qdrant Cloud (or keep local)
✅ Deploy API → Railway/Render/Fly.io
✅ Deploy Dashboard → Vercel
✅ Custom domain + SSL
✅ Monitoring + alerts
```

---

## 📋 **Phase 1: Database Migration (6-8 hours)**

### **Step 1: Create Supabase Project (30 minutes)**

1. **Sign up for Supabase**
   - Visit: https://supabase.com
   - Click "Start your project"
   - Sign in with GitHub

2. **Create New Project**
   ```
   Project Name: zerobanner-prod
   Database Password: [Generate strong password - save it!]
   Region: US East (Ohio) or EU (Frankfurt) - choose closest to your users
   Pricing: Free tier (50K MAU, 500MB database, 1GB file storage)
   ```

3. **Wait for Provisioning** (2-3 minutes)
   - Supabase creates PostgreSQL instance
   - Sets up authentication
   - Configures APIs

4. **Save Connection Strings**
   ```bash
   # Go to Settings → Database → Connection String
   
   # URI (for application):
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   
   # Connection Pooling (for serverless/high concurrency):
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
   
   # Save these in password manager!
   ```

---

### **Step 2: Export Current Database Schema (15 minutes)**

```bash
# 1. Ensure PostgreSQL container is running
docker compose up -d postgres

# 2. Export schema (structure only, no data yet)
docker exec zerobanner-fl-genai-postgres-1 pg_dump \
  -U zerobanner \
  -d zerobanner \
  --schema-only \
  --no-owner \
  --no-privileges \
  > schema_export.sql

# 3. Export data
docker exec zerobanner-fl-genai-postgres-1 pg_dump \
  -U zerobanner \
  -d zerobanner \
  --data-only \
  --no-owner \
  --no-privileges \
  --column-inserts \
  > data_export.sql

# 4. Review files
wc -l schema_export.sql data_export.sql
```

---

### **Step 3: Create Tables in Supabase (30 minutes)**

**Option A: SQL Editor (Recommended for learning)**

1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Run Python script to generate SQL:

```python
# scripts/generate_supabase_schema.py
# Run: python scripts/generate_supabase_schema.py

"""
Generates Supabase-compatible SQL from current models
Adds Row-Level Security (RLS) policies
"""

SCHEMA_SQL = """
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase handles auth, but we keep app metadata)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supabase_id UUID UNIQUE,  -- Links to auth.users
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

CREATE INDEX idx_users_supabase_id ON users(supabase_id);
CREATE INDEX idx_users_email ON users(email);

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free',
    monthly_events_limit INTEGER DEFAULT 10000,
    monthly_events_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Organization members (RBAC)
CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_org_members_org ON org_members(organization_id);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,
    privacy_mode TEXT DEFAULT 'high',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_org ON projects(organization_id);

-- API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_project ON api_keys(project_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_revoked ON api_keys(revoked_at);

-- Friction events (time-series data)
CREATE TABLE friction_events (
    hour TEXT NOT NULL,  -- ISO hour string (2026-06-18T14:00:00Z)
    project_id UUID NOT NULL,
    metric_type TEXT NOT NULL,
    event_count INTEGER DEFAULT 0,
    avg_intensity FLOAT,
    page_url_hash TEXT,
    top_element_hash TEXT,
    device_type TEXT,
    browser_family TEXT,
    PRIMARY KEY (hour, project_id, metric_type)
);

CREATE INDEX idx_friction_events_project ON friction_events(project_id, hour);
CREATE INDEX idx_friction_events_metric ON friction_events(metric_type, hour);

-- UX Auditor chat messages
CREATE TABLE ux_auditor_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_project ON ux_auditor_chat_messages(project_id, created_at);

-- Global models (for Federated Learning)
CREATE TABLE global_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    version INTEGER NOT NULL,
    weights JSONB NOT NULL,
    num_updates INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_global_models_project ON global_models(project_id, version);

-- ============================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE friction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ux_auditor_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_models ENABLE ROW LEVEL SECURITY;

-- Users: Can only see their own data
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (supabase_id = auth.uid());

CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (supabase_id = auth.uid());

-- Organizations: Users can only see orgs they're members of
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id 
            FROM org_members 
            WHERE user_id IN (
                SELECT id FROM users WHERE supabase_id = auth.uid()
            )
        )
    );

-- Org Members: Users can view members of their orgs
CREATE POLICY "Users can view org members"
    ON org_members FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM org_members 
            WHERE user_id IN (
                SELECT id FROM users WHERE supabase_id = auth.uid()
            )
        )
    );

-- Projects: Users can view projects in their orgs
CREATE POLICY "Users can view org projects"
    ON projects FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM org_members 
            WHERE user_id IN (
                SELECT id FROM users WHERE supabase_id = auth.uid()
            )
        )
    );

-- API Keys: Users can view keys for their projects
CREATE POLICY "Users can view project API keys"
    ON api_keys FOR SELECT
    USING (
        project_id IN (
            SELECT p.id 
            FROM projects p
            JOIN org_members om ON om.organization_id = p.organization_id
            JOIN users u ON u.id = om.user_id
            WHERE u.supabase_id = auth.uid()
        )
    );

-- Friction Events: Users can view events for their projects
CREATE POLICY "Users can view project friction events"
    ON friction_events FOR SELECT
    USING (
        project_id IN (
            SELECT p.id 
            FROM projects p
            JOIN org_members om ON om.organization_id = p.organization_id
            JOIN users u ON u.id = om.user_id
            WHERE u.supabase_id = auth.uid()
        )
    );

-- Chat Messages: Users can view chats for their projects
CREATE POLICY "Users can view project chats"
    ON ux_auditor_chat_messages FOR SELECT
    USING (
        project_id IN (
            SELECT p.id 
            FROM projects p
            JOIN org_members om ON om.organization_id = p.organization_id
            JOIN users u ON u.id = om.user_id
            WHERE u.supabase_id = auth.uid()
        )
    );

-- Global Models: Users can view models for their projects
CREATE POLICY "Users can view project models"
    ON global_models FOR SELECT
    USING (
        project_id IN (
            SELECT p.id 
            FROM projects p
            JOIN org_members om ON om.organization_id = p.organization_id
            JOIN users u ON u.id = om.user_id
            WHERE u.supabase_id = auth.uid()
        )
    );

-- ============================================
-- SERVICE ROLE POLICIES (for API access)
-- ============================================

-- API needs to bypass RLS to insert events
-- Use service_role key for API operations

-- Grant API access to insert friction events
CREATE POLICY "Service role can insert friction events"
    ON friction_events FOR INSERT
    WITH CHECK (true);  -- API validates API key separately

CREATE POLICY "Service role can update friction events"
    ON friction_events FOR UPDATE
    USING (true);

-- Grant API access to insert chat messages
CREATE POLICY "Service role can insert chat messages"
    ON ux_auditor_chat_messages FOR INSERT
    WITH CHECK (true);

-- Grant API access to manage models
CREATE POLICY "Service role can manage models"
    ON global_models FOR ALL
    USING (true);
"""

# Save to file
with open('supabase_schema.sql', 'w') as f:
    f.write(SCHEMA_SQL)

print("✅ Generated supabase_schema.sql")
print("📋 Next: Copy this SQL to Supabase SQL Editor and run it")
```

4. **Run the SQL in Supabase**
   - Copy generated `supabase_schema.sql`
   - Paste into Supabase SQL Editor
   - Click "Run"
   - Verify: Tables tab should show all tables

---

### **Step 4: Migrate Existing Data (1 hour)**

```bash
# Option A: Fresh start (no existing data to migrate)
# Skip to Step 5

# Option B: Migrate existing users/orgs/projects
# 1. Export from local PostgreSQL
docker exec zerobanner-fl-genai-postgres-1 psql \
  -U zerobanner \
  -d zerobanner \
  -c "COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER" \
  > users.csv

docker exec zerobanner-fl-genai-postgres-1 psql \
  -U zerobanner \
  -d zerobanner \
  -c "COPY (SELECT * FROM organizations) TO STDOUT WITH CSV HEADER" \
  > organizations.csv

# 2. Import to Supabase via SQL Editor
# Supabase → SQL Editor → New Query
# Paste CSV data:

COPY users FROM STDIN WITH CSV HEADER;
[paste users.csv content]
\.

COPY organizations FROM STDIN WITH CSV HEADER;
[paste organizations.csv content]
\.

# 3. Verify
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM organizations;
```

---

### **Step 5: Update Backend Configuration (30 minutes)**

```bash
# 1. Install Supabase Python SDK
cd server
pip install supabase
echo "supabase==2.11.0" >> requirements.txt

# 2. Update .env with Supabase credentials
cat >> .env << 'EOF'

# ============================================
# SUPABASE CONFIGURATION (Production Database)
# ============================================

# Get these from Supabase Dashboard → Settings → API
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Public key (safe for frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Secret key (backend only)

# Database connection (use connection pooling for production)
ZEROBANNER_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true

# Legacy (keep for local dev fallback)
# ZEROBANNER_DATABASE_URL=postgresql://zerobanner:zerobanner@postgres:5432/zerobanner

EOF

# 3. Verify .env is in .gitignore (NEVER commit secrets!)
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

---

### **Step 6: Test Connection (15 minutes)**

```python
# test_supabase_connection.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Test 1: Supabase client
print("🔍 Test 1: Supabase Client Connection")
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env")
    exit(1)

supabase: Client = create_client(url, key)
print(f"✅ Connected to: {url}")

# Test 2: Query tables
print("\n🔍 Test 2: Query Tables")
try:
    result = supabase.table("users").select("count", count="exact").execute()
    print(f"✅ Users table: {result.count} rows")
    
    result = supabase.table("organizations").select("count", count="exact").execute()
    print(f"✅ Organizations table: {result.count} rows")
    
    result = supabase.table("projects").select("count", count="exact").execute()
    print(f"✅ Projects table: {result.count} rows")
    
except Exception as e:
    print(f"❌ Query failed: {e}")
    exit(1)

# Test 3: PostgreSQL connection (via SQLAlchemy)
print("\n🔍 Test 3: PostgreSQL Connection (SQLAlchemy)")
from sqlalchemy import create_engine, text

db_url = os.getenv("ZEROBANNER_DATABASE_URL")
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print(f"✅ PostgreSQL version: {version[:50]}...")
        
        result = conn.execute(text("SELECT COUNT(*) FROM users"))
        count = result.fetchone()[0]
        print(f"✅ Users count via SQLAlchemy: {count}")
        
except Exception as e:
    print(f"❌ SQLAlchemy connection failed: {e}")
    exit(1)

print("\n🎉 All tests passed! Supabase is ready.")
```

```bash
# Run test
python test_supabase_connection.py
```

---

### **Step 7: Update docker-compose.yml (30 minutes)**

```yaml
# docker-compose.yml
# Keep local PostgreSQL for development, use Supabase for production

services:
  # LOCAL DEVELOPMENT ONLY (comment out for production)
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: zerobanner
      POSTGRES_PASSWORD: zerobanner
      POSTGRES_DB: zerobanner
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zerobanner -d zerobanner"]
      interval: 2s
      timeout: 5s
      retries: 30
    profiles:
      - local  # Only start with: docker compose --profile local up

  redis:
    image: redis:7
    ports:
      - "6380:6379"

  qdrant:
    image: qdrant/qdrant:v1.11.5
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  api:
    build:
      context: ./server
    environment:
      # Supabase (Production) or Local PostgreSQL (Development)
      DATABASE_URL: ${ZEROBANNER_DATABASE_URL}
      
      # Supabase Auth Keys
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      
      # Redis, Qdrant (still local for now)
      REDIS_URL: ${ZEROBANNER_REDIS_URL:-redis://redis:6379/0}
      QDRANT_URL: ${QDRANT_URL:-http://qdrant:6333}
      
      # ... rest of config ...
    ports:
      - "8001:8000"
    depends_on:
      # Only depend on postgres if running local profile
      redis:
        condition: service_started
      qdrant:
        condition: service_started

  dashboard:
    build:
      context: ./dashboard
    environment:
      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8001}
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
    ports:
      - "3001:3000"
    depends_on:
      - api

volumes:
  postgres_data:  # Only used for local dev
  qdrant_data:
```

```bash
# Start with Supabase (production)
docker compose up -d

# OR start with local PostgreSQL (development)
docker compose --profile local up -d
```

---

### **Step 8: Deploy & Test (1 hour)**

```bash
# 1. Rebuild containers with new configuration
docker compose down
docker compose up -d --build

# 2. Check API logs
docker logs zerobanner-fl-genai-api-1 --tail 50

# Should see: "Connected to Supabase PostgreSQL"

# 3. Test API endpoints
curl http://localhost:8001/docs

# 4. Create test user via API
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'

# 5. Verify in Supabase Dashboard
# Go to: Table Editor → users
# Should see new user with supabase_id populated

# 6. Test dashboard login
open http://localhost:3001/login
# Login with test@example.com / TestPassword123!
```

---

## 📊 **Phase 1 Complete! What You Now Have:**

✅ **Database:** Supabase PostgreSQL (cloud, backed up, scalable)  
✅ **Data Safety:** Automatic backups, point-in-time recovery  
✅ **Monitoring:** Supabase Dashboard shows queries, performance  
✅ **Security:** Row-level security (RLS) policies enforced  
✅ **Local Dev:** Can still use local PostgreSQL with `--profile local`  
✅ **API:** Updated to use Supabase connection string  
✅ **Dashboard:** Ready for Phase 2 (Supabase Auth integration)

**What's Still Local:**
- Redis (rate limiting, caching)
- Qdrant (vector search for AI Auditor)
- API/Dashboard Docker containers (running on your machine)

---

## 🔐 **Phase 2: Supabase Auth Integration (8 hours)**

*Coming in next document: SUPABASE_AUTH_MIGRATION.md*

**Preview:**
1. Setup Supabase Auth providers (Google, GitHub, Email)
2. Update backend to use Supabase JWT validation
3. Add `supabase_id` column to users table
4. Update dashboard to use Supabase Auth SDK
5. Implement email verification flow
6. Implement password reset flow
7. Add OAuth login buttons
8. Test complete auth flow

---

## 🎨 **Phase 3: Dashboard UI Overhaul (Supabase Style) (16 hours)**

*Coming in next document: DASHBOARD_UI_REDESIGN.md*

**Preview:**
1. **Left Sidebar Navigation** (like Supabase)
   - Projects dropdown
   - Overview
   - Analytics
   - AI Auditor
   - Settings
   - API Keys
   - Team Members

2. **Supabase-Style Components**
   - Dark mode by default
   - Tailwind CSS + shadcn/ui components
   - Green accent colors (#3ECF8E)
   - Smooth animations
   - Professional typography (Inter font)

3. **Page Layouts**
   - Dashboard home (overview with cards)
   - Analytics page (charts, graphs)
   - AI Auditor (chat interface)
   - Settings (tabs for profile, security, billing)

---

## 💰 **Cost Breakdown**

### **Supabase Free Tier (Current)**
- ✅ 500 MB database storage
- ✅ 50,000 monthly active users
- ✅ 1 GB file storage
- ✅ 50 GB bandwidth
- ✅ 2 GB bandwidth for file storage
- ✅ Unlimited API requests
- ✅ Social OAuth providers
- ✅ Email auth (1,000 emails/month via SendGrid)
- ✅ 7-day log retention
- ✅ Community support

**When you'll hit limits:**
- ~5,000 users with analytics data = ~500 MB
- ~100,000 page views/month = ~50 GB bandwidth

**Estimated: 3-6 months before needing Pro tier**

### **Supabase Pro Tier ($25/month)**
- ✅ 8 GB database storage
- ✅ 100,000 monthly active users
- ✅ 100 GB file storage
- ✅ 200 GB bandwidth
- ✅ 28-day log retention
- ✅ Daily backups (point-in-time recovery)
- ✅ Email support
- ✅ Custom domains
- ✅ Remove "Powered by Supabase" branding

**When you'll need this:**
- 10,000+ users
- 1 million+ page views/month
- Need longer log retention
- Want email support

---

## 🔒 **Security Improvements**

### **Before (Local Docker):**
- ❌ No backups (data loss if disk fails)
- ❌ No SSL (HTTP only in development)
- ⚠️ Basic JWT auth (no email verification)
- ⚠️ No OAuth (password only)
- ⚠️ No rate limiting
- ⚠️ No audit logs
- ⚠️ No 2FA

### **After (Supabase):**
- ✅ Automatic backups (7-day retention)
- ✅ SSL by default (all connections encrypted)
- ✅ Enterprise-grade auth (email verification built-in)
- ✅ OAuth (Google, GitHub, Azure, etc.)
- ✅ Built-in rate limiting
- ✅ Audit logs (who accessed what, when)
- ✅ 2FA support (optional for users)
- ✅ Row-level security (RLS) - users can only see their data
- ✅ API keys scoped to projects
- ✅ GDPR-compliant (EU hosting available)

---

## 📈 **Monitoring & Observability**

### **Supabase Dashboard Provides:**

1. **Database Performance**
   - Query performance (slow queries highlighted)
   - Connection pool status
   - Disk usage trends
   - Table sizes

2. **API Logs**
   - Real-time request logs
   - Error rates
   - Response times
   - Geographic distribution

3. **Auth Logs**
   - Login attempts (successful/failed)
   - New user registrations
   - Password reset requests
   - OAuth provider usage

4. **Usage Metrics**
   - Monthly active users (MAU)
   - API requests
   - Bandwidth usage
   - Storage usage

5. **Alerts** (Pro tier)
   - Database near capacity
   - High error rates
   - Slow queries
   - Unusual traffic patterns

---

## 🚀 **Next Steps (This Week)**

### **Immediate (Today):**
1. [ ] Create Supabase account (15 min)
2. [ ] Create new project (5 min)
3. [ ] Save connection strings in password manager (5 min)
4. [ ] Generate `supabase_schema.sql` script (15 min)
5. [ ] Run schema in Supabase SQL Editor (10 min)

### **Day 1 (Tomorrow):**
1. [ ] Install `supabase` Python package (5 min)
2. [ ] Update `.env` with Supabase credentials (10 min)
3. [ ] Run connection test script (15 min)
4. [ ] Update `docker-compose.yml` (30 min)
5. [ ] Test API with Supabase database (1 hour)

### **Day 2 (This Week):**
1. [ ] Migrate existing data (if any) (1 hour)
2. [ ] Update API authentication logic (2 hours)
3. [ ] Test complete auth flow (1 hour)
4. [ ] Deploy to production (1 hour)
5. [ ] Monitor for 24 hours

### **Week 2:**
1. [ ] Implement Supabase Auth (Phase 2)
2. [ ] Redesign dashboard UI (Phase 3)
3. [ ] Add monitoring/alerts
4. [ ] Load testing
5. [ ] Security audit

---

## ✅ **Migration Checklist**

Before switching to Supabase:
- [ ] Exported current database schema
- [ ] Exported current data (if any)
- [ ] Created Supabase project
- [ ] Ran schema SQL in Supabase
- [ ] Tested connection from API
- [ ] Updated `.env` with Supabase URL
- [ ] Added `.env` to `.gitignore`
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Tested API key creation
- [ ] Tested friction event insertion
- [ ] Tested dashboard login
- [ ] Verified data in Supabase dashboard
- [ ] Set up backups (automatic in Supabase)
- [ ] Documented rollback plan (keep local PostgreSQL volume)

After migration:
- [ ] Monitor Supabase dashboard for 24h
- [ ] Check API error logs
- [ ] Test all user flows
- [ ] Update team on new database
- [ ] Schedule Phase 2 (Auth migration)

---

## 🔙 **Rollback Plan (If Something Goes Wrong)**

```bash
# 1. Stop current containers
docker compose down

# 2. Restore .env to use local PostgreSQL
sed -i 's|postgresql://postgres.*supabase.*|postgresql://zerobanner:zerobanner@postgres:5432/zerobanner|' .env

# 3. Start with local PostgreSQL
docker compose --profile local up -d

# 4. Verify API works
curl http://localhost:8001/docs

# Your local data is safe! It's still in Docker volume.
```

---

## 📚 **Resources**

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Migration Guide: https://supabase.com/docs/guides/database/migrating-between-projects
- Row-Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Supabase Python SDK: https://supabase.com/docs/reference/python/introduction

---

**Ready to start? Let me know and I'll help you through each step!** 🚀
