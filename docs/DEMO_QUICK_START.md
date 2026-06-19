# Demo Quick Start Guide

**5-Minute Setup for Job Interview Demos**

---

## 📋 Pre-Demo Checklist

Before the interview:
- [ ] Read [docs/DEMO_PREPARATION.md](DEMO_PREPARATION.md) (comprehensive guide)
- [ ] Test demo 2-3 times (don't wait for interview day!)
- [ ] Have backup: recorded video or screenshots
- [ ] Know your 5-minute script by heart

---

## 🚀 Quick Demo Setup (First Time)

### 1. Environment Setup (5 minutes)

```bash
cd /home/mnvgowda/MNVProjects/ZeroBanner-FL-GenAI

# Copy environment template
cp env.example .env

# Edit .env - minimal config needed:
nano .env
```

**Required changes in `.env`:**
```bash
# Database (default works)
ZEROBANNER_DATABASE_URL=postgresql://zerobanner:zerobanner@postgres:5432/zerobanner

# API Key Salt (change this)
ZEROBANNER_API_KEY_SALT=your-random-string-here

# Dashboard URL (default works)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Optional: Add LLM for AI Auditor (skip for basic demo)
# DEEPSEEK_API_KEY=your-key-here
# LLM_BACKEND=deepseek
```

---

### 2. Start Services (2 minutes)

```bash
# Pull images (first time only, takes 3-5 minutes)
docker-compose pull

# Start all services
docker-compose up -d

# Wait 30-60 seconds for startup
sleep 60

# Verify all services running
docker-compose ps
```

**Expected output:**
```
NAME                                    STATUS
zerobanner-fl-genai-postgres-1         Up (healthy)
zerobanner-fl-genai-redis-1            Up
zerobanner-fl-genai-qdrant-1           Up
zerobanner-fl-genai-api-1              Up
zerobanner-fl-genai-dashboard-1        Up
```

---

### 3. Test Dashboard Access (1 minute)

```bash
# Open dashboard
open http://localhost:3000

# Or manually navigate to:
# http://localhost:3000
```

**Login with demo account:**
- Email: `demo@zerobanner.local`
- Password: `DemoPassword123!`

**Verify:**
- [ ] Dashboard loads
- [ ] See "Demo Website" project
- [ ] Analytics charts show 7 days of data
- [ ] No console errors in browser

---

## 🎬 5-Minute Demo Script

### **1. Introduction (30 seconds)**
> "I built ZeroBanner, a privacy-first UX analytics platform using Federated Learning.
> 
> Traditional analytics like Google Analytics collect user data centrally, creating privacy risks. My system trains ML models in users' browsers, so personal data never leaves their device.
>
> Let me show you how it works..."

---

### **2. Show Architecture (1 minute)**
> "The system has three main components:
> 
> **First, the Browser SDK** *(show client/src/index.ts)*
> - Detects UX friction: rage clicks, hesitation, confusion
> - Runs ONNX models locally for on-device inference
> - Trains models using local user behavior
> - Only sends aggregated model updates, never raw data
> 
> **Second, the FastAPI Backend** *(show server/src/app.py)*
> - Implements federated aggregation algorithm
> - Applies differential privacy (gradient clipping + noise)
> - No PII storage - GDPR compliant by design
> 
> **Third, the Dashboard** *(show dashboard/)*
> - Next.js 15 with React 19
> - Analytics visualizations
> - AI-powered UX recommendations
> 
> Let me run it live..."

---

### **3. Live Demo (2 minutes)**

```bash
# Already running from setup
open http://localhost:3000
```

#### **Dashboard Walkthrough:**

1. **Login page** → Enter demo credentials
   
2. **Overview Dashboard** (`/app/overview`)
   > "Here's 7 days of friction analytics. Notice:
   > - Friction score: 67/100 (moderate issues)
   > - Rage clicks peak during lunch hours (2-4pm)
   > - Mobile users have 2x more friction than desktop
   > - Charts show hourly breakdowns"

3. **Recommendations** (`/app/recommendations`)
   > "The system detected 3 UX issues:
   > - **Critical**: Rage clicks on checkout button (234 incidents)
   > - **High**: Hesitation on shipping form (89 users)
   > - **Medium**: Users backtrack between cart and product
   > 
   > Each recommendation includes:
   > - What's happening (evidence)
   > - Why it's happening (analysis)
   > - Who's affected (segmentation)
   > - How to fix it (code snippets)
   > - Estimated business impact in euros"

4. **AI Auditor** (`/app/auditor`)
   > *(If LLM configured)*
   > "This uses a RAG pipeline with vector search. Let me ask a question..."
   > 
   > Type: **"Why are users abandoning checkout?"**
   > 
   > *(Show response with evidence and actions)*
   > "It analyzes aggregated friction patterns and provides evidence-based insights. No individual user tracking."
   > 
   > *(If NO LLM)*
   > "The AI Auditor uses DeepSeek/GPT-4 for semantic search. I can set it up with an API key, but for this demo I'm focusing on the core FL implementation."

---

### **4. Technical Highlights (1 minute)**
> "Key technical achievements:
> 
> **ML Performance:**
> - Two trained models: 99.95% and 99.90% accuracy
> - ONNX format for cross-platform deployment
> - 22 KB total model size (extremely lightweight)
> 
> **Privacy Engineering:**
> - Differential privacy with configurable epsilon
> - Zero PII collection by design
> - Ephemeral client IDs (rotate daily)
> - GDPR Article 4(1) compliant
> 
> **Code Quality:**
> - 19 test files covering FL aggregation, model merging, RAG pipeline
> - Full type safety: Python type hints + TypeScript
> - Docker deployment ready
> - 170+ files, 10,000+ lines of code
>
> **Architecture:**
> - Multi-tenant with org/project isolation
> - JWT authentication
> - Redis rate limiting
> - TimescaleDB for time-series analytics"

---

### **5. Next Steps (30 seconds)**
> "The MVP is functional, but to make it production-ready, I'd need:
> - Load testing (target: 10K concurrent users)
> - Security audit (pen testing, vulnerability scanning)
> - Monitoring/alerting (Datadog, Sentry)
> - Customer deployments (real data validation)
> 
> I understand FL theory and implementation. I want to learn production engineering from experienced team members - DevOps, observability, and scaling distributed systems.
>
> That's why I'm excited about this role. Questions?"

---

## 🐛 Troubleshooting Common Issues

### **Issue: Services won't start**
```bash
# Check logs
docker-compose logs api
docker-compose logs dashboard

# Common fix: port conflicts
lsof -i :8000  # Check API port
lsof -i :3000  # Check dashboard port

# Nuclear option: restart fresh
docker-compose down -v
docker-compose up -d --force-recreate
```

---

### **Issue: Dashboard shows no data**
```bash
# Verify demo seed ran
docker-compose logs api | grep "demo@zerobanner"

# Manually trigger seed
docker-compose exec api python -m src.demo_harness
```

---

### **Issue: Can't login**
- Default credentials: `demo@zerobanner.local` / `DemoPassword123!`
- Check: API logs for authentication errors
- Check: Browser console for network errors
- Fallback: Create new account via `/signup`

---

### **Issue: AI Auditor not working**
- **Expected**: Needs LLM API key (DeepSeek, OpenAI, or Ollama)
- **Fix**: Add `DEEPSEEK_API_KEY` to `.env` and restart
- **Demo workaround**: "This feature requires an LLM API. I can show the RAG pipeline code instead."

---

## 📱 Demo Backup Plan

### **Plan A: Live Demo** (preferred)
- Run `docker-compose up -d` before interview
- Test dashboard access
- Have browser tabs ready

### **Plan B: Recorded Video** (if live fails)
- Record 3-minute screencast showing:
  1. Docker startup
  2. Dashboard walkthrough
  3. Key features
  4. Code explanation
- Upload to YouTube (unlisted) or Loom
- Have link ready in README

### **Plan C: Screenshots + Code Walkthrough** (last resort)
- Show architecture diagrams
- Walk through code in IDE
- Explain FL algorithm with whiteboard
- Show test results: `pytest tests/ -v`

---

## 🎯 Interview Preparation Checklist

### **Technical Prep**
- [ ] Run demo 3 times successfully
- [ ] Memorize demo script
- [ ] Know your code: can navigate files quickly
- [ ] Practice explaining FL without jargon
- [ ] Prepare answers for scaling questions

### **Demo Day**
- [ ] Start Docker 10 minutes before call
- [ ] Test dashboard access
- [ ] Close unnecessary browser tabs
- [ ] Have backup video link ready
- [ ] Terminal visible for code walkthrough
- [ ] IDE open to key files (app.py, index.ts)

### **Common Questions to Prepare**
1. "How does FL differ from normal ML?" → Show aggregation code
2. "What's your privacy epsilon?" → Explain DP parameters
3. "How do you handle malicious clients?" → Gradient clipping
4. "What's missing for production?" → Monitoring, security audit
5. "How would you scale this?" → Kubernetes, horizontal sharding

---

## ⏱️ Time Budget

**First Time Setup**: 8-10 minutes
- Environment config: 5 min
- Docker pull/start: 3-5 min

**Subsequent Demos**: 2-3 minutes
- Docker start: 1 min
- Dashboard access: 1 min

**Actual Demo**: 5-7 minutes
- Introduction: 30 sec
- Architecture: 1 min
- Live dashboard: 2 min
- Technical highlights: 1 min
- Q&A buffer: 1-2 min

---

## 🚀 Ready to Demo!

Your project is genuinely impressive. The FL implementation puts you in the **top 5% of candidates**. 

**Key Message**: You built something rare and valuable. Own it. Be confident. You understand advanced ML concepts and can implement them from scratch. That's what matters.

**Remember**: 
- Employers hire for **potential + skills**, not perfect projects
- This demonstrates **learning ability + execution**
- Be honest about limitations (shows maturity)
- Show **enthusiasm for production engineering**

**Good luck!** 🎉
