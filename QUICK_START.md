# 🚀 Quick Start Guide - PrivacyEdge MVP Demo

Complete guide to run the demo locally for job interviews and presentations.

---

## ⚡ **5-Minute Startup (From Scratch)**

### **Prerequisites**
- Docker & Docker Compose installed
- Ports available: 3001, 5433, 6333, 6380, 8001, 8080
- ~2GB free RAM

### **Step 1: Clone & Navigate**
```bash
cd /home/mnvgowda/MNVProjects/UX-Friction-FL-GenAI
```

### **Step 2: Start All Services**
```bash
docker compose up -d
```

**Expected Output:**
```
✔ Container ux-friction-fl-genai-postgres-1    Started
✔ Container ux-friction-fl-genai-redis-1       Started
✔ Container ux-friction-fl-genai-qdrant-1      Started
✔ Container ux-friction-fl-genai-api-1         Started
✔ Container ux-friction-fl-genai-dashboard-1   Started
```

**Wait 30 seconds** for services to fully initialize.

### **Step 3: Verify Services**
```bash
docker ps --format "table {{.Names}}\t{{.Status}}" | grep ux-friction
```

All containers should show "Up X minutes".

### **Step 4: Generate API Key**
```bash
bash scripts/generate_demo_api_key.sh
```

**Save the API key** displayed (starts with `pe_`).

### **Step 5: Start Demo Server**
```bash
bash scripts/serve_demo.sh
```

Runs on http://localhost:8080 (keep terminal open).

### **Step 6: Open Demo**

**In your browser:**

1. **Demo Page:** http://localhost:8080/test-page-real-sdk.html
2. **Dashboard:** http://localhost:3001/login
   - Email: `demo@zerobanner.local`
   - Password: `DemoPassword123!`
3. **API Docs:** http://localhost:8001/docs

---

## 🎯 **What's Running?**

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| **PostgreSQL** | 5433 | Analytics storage | `docker logs ux-friction-fl-genai-postgres-1` |
| **Redis** | 6380 | Rate limiting | `docker logs ux-friction-fl-genai-redis-1` |
| **Qdrant** | 6333 | Vector search | http://localhost:6333 |
| **FastAPI** | 8001 | FL backend | http://localhost:8001/docs |
| **Next.js** | 3001 | Dashboard UI | http://localhost:3001 |
| **HTTP Server** | 8080 | Demo pages | http://localhost:8080 |

---

## 🧪 **Testing the Demo**

### **Test 1: Rage Clicks** *(30 seconds)*
1. Open http://localhost:8080/test-page-real-sdk.html
2. Click "Test Rage Clicks" button **7+ times rapidly**
3. See event log show: `🔥 RAGE CLICK DETECTED!`
4. Verify: "Rage Clicks" metric increments

**What's happening:**
- Browser SDK detects rapid click pattern
- Event aggregated locally (no PII sent)
- Gradient update queued for server

### **Test 2: Hesitation** *(30 seconds)*
1. **Hover** over "Test Hesitation" button
2. **DO NOT CLICK** - just hover for 2+ seconds
3. See timer count up: `Hover: 2.1s`
4. Event log shows: `⏱️ HESITATION DETECTED!`

**What's happening:**
- SDK tracks hover duration passively
- Detects user uncertainty about CTA
- Aggregates as UX friction signal

### **Test 3: Confusion** *(30 seconds)*
1. **Rapidly click** all 4 option buttons (A, B, C, D)
2. Click at least **4 times within 2 seconds**
3. Event log shows: `🔀 CONFUSION DETECTED!`

**What's happening:**
- SDK detects rapid UI switching pattern
- Indicates unclear navigation/choices
- Aggregated as confusion signal

---

## 📊 **Verifying End-to-End Flow**

### **Full Integration Test** *(5 minutes)*

1. **Trigger Events** (demo page)
   ```
   - 5+ rage clicks
   - 1 hesitation (2s+ hover)
   - 4 rapid confusion clicks
   ```

2. **Check Event Log** (demo page)
   - Verify all events detected
   - Look for "✅ Event aggregated locally"

3. **Check API Logs**
   ```bash
   docker logs ux-friction-fl-genai-api-1 | tail -50
   ```
   - Look for `POST /collect` requests
   - Should see gradient updates received

4. **Check Dashboard** (http://localhost:3001)
   - Login with demo account
   - Navigate to `/app/overview`
   - *(Note: Real analytics requires background aggregation job)*

---

## 🔧 **Common Issues & Fixes**

### **Issue 1: Port Already in Use**
```bash
Error: bind: address already in use
```

**Fix:**
```bash
# Find process using the port (example: 8001)
lsof -ti:8001 | xargs kill -9

# Or change ports in docker-compose.yml
```

### **Issue 2: API Returns 404 for /static/client.js**
```bash
# Rebuild API container with static files
docker compose up -d --build api

# Verify files exist
docker exec ux-friction-fl-genai-api-1 ls -lh /app/static/
```

### **Issue 3: SDK Import Error in Browser**
```
Failed to resolve module specifier "http://localhost:8001/static/client.js"
```

**Fix:**
- Ensure API is running: `curl http://localhost:8001/static/client.js`
- Check browser console for CORS errors
- Verify demo served from http:// not file://

### **Issue 4: Dashboard Shows No Data**
```
"No analytics data available"
```

**Expected:** MVP doesn't have real-time aggregation background job yet.

**Workaround:**
```bash
# Seed demo data
docker exec ux-friction-fl-genai-api-1 python scripts/seed_demo_data.py
```

### **Issue 5: API Key Generation Fails**
```bash
❌ Login failed. Response: {"detail":"Invalid credentials"}
```

**Fix:**
```bash
# Reset database and restart
docker compose down -v
docker compose up -d

# Wait 30 seconds, then retry
bash scripts/generate_demo_api_key.sh
```

---

## 📝 **Demo Script for Interviews**

### **Opening (30 seconds)**
> "I built PrivacyEdge - a privacy-first UX analytics platform using Federated Learning. Let me show you the complete system running locally."

### **Live Demo (2 minutes)**
1. **Show Services:** `docker ps`
2. **Open Demo Page:** http://localhost:8080/test-page-real-sdk.html
3. **Trigger Rage Clicks:** Click rapidly 7+ times
4. **Show Event Log:** Point out real-time detection
5. **Explain Privacy:** "All ML inference happens in browser, no PII sent"

### **Code Walkthrough (2 minutes)**
1. **SDK:** Show [client/src/index.ts](client/src/index.ts) - PrivacyEdgeAnalytics class
2. **FL Server:** Show [server/src/app.py](server/src/app.py) - aggregation logic
3. **Privacy:** Explain differential privacy (ε=1.0, gradient clipping)

### **Technical Highlights (1 minute)**
- **ML:** 99.95% accuracy, 22KB models, ONNX Runtime Web
- **Privacy:** ε=1.0 differential privacy, zero PII
- **Stack:** TypeScript, FastAPI, Next.js, PostgreSQL, Docker
- **Testing:** 19 test files, 10K+ lines of code

### **Closing (30 seconds)**
> "This demonstrates core FL implementation. Production needs load testing, security audits, and monitoring. I want to learn production engineering from your team to take systems like this to scale."

---

## 🧹 **Cleanup & Reset**

### **Stop All Services**
```bash
docker compose down
```

### **Full Reset (Delete All Data)**
```bash
docker compose down -v
rm -f .demo_api_key
```

### **Restart Fresh**
```bash
docker compose up -d
bash scripts/generate_demo_api_key.sh
bash scripts/serve_demo.sh
```

---

## 📦 **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Demo Page (http://localhost:8080)                   │  │
│  │                                                       │  │
│  │  Loads: PrivacyEdgeAnalytics SDK ─────────────┐     │  │
│  │  From:  http://localhost:8001/static/client.js │    │  │
│  └────────────────────────────────────────────────┼─────┘  │
│                                                    │        │
│  ┌──────────────────────────────────────────────┐ │        │
│  │  PrivacyEdge SDK (Local Training)            │ │        │
│  │  • Detects rage/hesitation/confusion         │◄┘        │
│  │  • Trains models locally (ONNX Runtime Web)  │          │
│  │  • Computes gradient updates                  │          │
│  │  • NO PII leaves browser                      │          │
│  └────────────────┬─────────────────────────────┘          │
└─────────────────────┼────────────────────────────────────────┘
                      │ HTTP POST /collect (gradient only)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Backend                            │
│              (http://localhost:8001)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Federated Learning Server                           │  │
│  │  • Receives gradient updates from clients            │  │
│  │  • Applies weighted averaging (FedAvg)               │  │
│  │  • Adds differential privacy noise (ε=1.0)           │  │
│  │  • Updates global model                               │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL + TimescaleDB                   │
│              (localhost:5433)                               │
│  • Stores aggregated analytics (no PII)                    │
│  • Time-series data: hourly/daily rollups                  │
│  • Multi-tenant: org_id, project_id isolation              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Dashboard                          │
│              (http://localhost:3001)                        │
│  • Login: demo@zerobanner.local / DemoPassword123!         │
│  • Overview: Friction score trends, hourly breakdown       │
│  • AI Auditor: RAG pipeline with Qdrant vector search      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 **Learning Outcomes - What This Demonstrates**

### **1. Federated Learning Implementation**
- ✅ Client-side training in browser
- ✅ Gradient aggregation with FedAvg
- ✅ Differential privacy (clipping + noise)
- ✅ Zero raw data collection

### **2. Full-Stack Engineering**
- ✅ TypeScript SDK with ONNX Runtime Web
- ✅ FastAPI backend with async/await
- ✅ Next.js dashboard with SSR
- ✅ PostgreSQL with TimescaleDB extension
- ✅ Docker multi-container orchestration

### **3. Privacy Engineering**
- ✅ GDPR-compliant by design
- ✅ Mathematical privacy guarantees
- ✅ Ephemeral client IDs (no tracking)
- ✅ RAM-only buffers (no persistence)

### **4. Production Readiness (MVP → Production)**
- 🔄 **Needs:** Load testing (10K concurrent users)
- 🔄 **Needs:** Security audit + pen testing
- 🔄 **Needs:** Monitoring (Prometheus, Grafana)
- 🔄 **Needs:** CI/CD pipeline (GitHub Actions)
- 🔄 **Needs:** Multi-region deployment

---

## 🚨 **Before Your Interview**

### **Checklist (30 min before)**
- [ ] Start all services: `docker compose up -d`
- [ ] Verify dashboard loads: http://localhost:3001
- [ ] Verify API docs: http://localhost:8001/docs
- [ ] Generate fresh API key
- [ ] Test demo page: all 3 friction types
- [ ] Open code in IDE (app.py, index.ts)
- [ ] Review DEMO_WALKTHROUGH.md
- [ ] Close unnecessary apps
- [ ] Silence notifications
- [ ] Have water nearby!

### **Backup Plans**
- **Plan A:** Live demo (preferred)
- **Plan B:** Recorded screencast (if live fails)
- **Plan C:** Screenshots + code walkthrough

### **Key Messages**
1. "I implemented FL which puts me in top 5% of candidates"
2. "I designed for GDPR compliance from day one"
3. "19 tests, full type safety - production-quality code"
4. "I want to learn production engineering from your team"
5. "I can explain every line of code - I wrote it all"

---

## 🎯 **Success Criteria**

After demo, interviewer should think:

✅ "This person understands complex ML concepts"  
✅ "They can build full-stack systems"  
✅ "They write production-quality code"  
✅ "They're honest about limitations"  
✅ "They want to learn and grow"  
✅ "They can explain technical concepts clearly"

---

**Good luck, Mohana! You've got this!** 🚀

---

## 📞 **Need Help?**

**Check logs:**
```bash
# API logs
docker logs ux-friction-fl-genai-api-1

# Dashboard logs
docker logs ux-friction-fl-genai-dashboard-1

# Database logs
docker logs ux-friction-fl-genai-postgres-1
```

**Test connectivity:**
```bash
# API health
curl http://localhost:8001/docs

# Static files
curl -I http://localhost:8001/static/client.js

# Dashboard
curl http://localhost:3001/login
```

**Restart single service:**
```bash
docker compose restart api
docker compose restart dashboard
```
