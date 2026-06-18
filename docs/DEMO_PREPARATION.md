# Demo Preparation Guide

**Goal**: Prepare a working 5-10 minute demo for job interviews showing the complete PrivacyEdge system.

---

## ✅ What's Working (Demo-Ready)

### 1. **Backend Infrastructure** ✅
- **FastAPI server**: 992 lines, complete FL aggregation logic
- **Database setup**: PostgreSQL + TimescaleDB schema
- **Authentication**: JWT-based with org/project isolation
- **Demo seed data**: Automatic demo account + sample analytics data
- **Docker Compose**: All services configured (postgres, redis, qdrant, api, dashboard)

### 2. **ML Models** ✅
- **foundation_model.onnx** (2.2 KB): UX friction detector, 99.95% accuracy
- **intent_embedder.onnx** (20 KB): Intent classifier, 99.90% accuracy
- Both models trained and ready in `ml-training/`

### 3. **Dashboard Pages** ✅
Complete Next.js 15 application with:
- **Login/Signup**: `/login`, `/signup`
- **Overview Dashboard**: `/app/overview` - Analytics charts, friction scores
- **AI Auditor**: `/app/auditor` - Chat interface with RAG pipeline
- **Recommendations**: `/app/recommendations` - Prioritized UX fixes
- **Projects**: `/app/projects` - Multi-project management
- **API Keys**: `/app/keys` - Key generation and management
- **Settings**: `/app/settings` - Configuration

### 4. **Client SDK** ✅
- **TypeScript SDK**: 621 lines, complete FL client implementation
- **ONNX Runtime**: Browser-based model inference ready
- **Event tracking**: Click, scroll, navigation detection
- Located in `client/src/index.ts`

### 5. **Demo Data Seeding** ✅
- **Automatic account**: `demo@zerobanner.local` / `DemoPassword123!`
- **Sample org**: "ZeroBanner Demo GmbH"
- **Sample project**: "Demo Website" with API key
- **7 days of friction events**: Rage clicks, hesitation, confusion, dead ends
- **3 recommendations**: Critical/high/medium priority UX fixes

---

## ❌ What's Missing (Needs Work)

### **CRITICAL (Must Fix for Demo)**

#### 1. **Client SDK Not Integrated** 🚨
**Problem**: SDK exists but not built/deployed for browser use
- No npm package published
- No CDN-hosted bundle
- Dashboard can't actually load the SDK

**Fix Required**:
```bash
cd client
pnpm install
pnpm build  # Builds dist/index.js
# Option A: Serve from /api/v1/sdk/client.js endpoint
# Option B: Copy to dashboard/public/sdk.js
```

**Estimated Time**: 2-3 hours

---

#### 2. **No Test Page for SDK Demo** 🚨
**Problem**: No way to show the SDK actually working
- Can't demonstrate real-time event detection
- Can't show FL training in action

**Fix Required**: Create `demo/test-page.html`:
```html
<!DOCTYPE html>
<html>
<head><title>PrivacyEdge SDK Test</title></head>
<body>
  <h1>Click around to generate friction events</h1>
  <button id="testBtn">Rapid Click Me (Rage Test)</button>
  <script src="http://localhost:8000/api/v1/sdk/client.js"></script>
  <script>
    PrivacyEdge.init({
      apiKey: 'YOUR_DEMO_API_KEY',
      apiBaseUrl: 'http://localhost:8000'
    });
  </script>
</body>
</html>
```

**Estimated Time**: 1-2 hours

---

#### 3. **Environment Variables Not Documented** 🚨
**Problem**: `.env` file not created, unclear what's required
- Database URLs undefined
- LLM API keys missing
- Demo won't start without proper config

**Fix Required**: 
1. Copy `env.example` to `.env`
2. Add minimal working values
3. Document optional vs required vars

**Estimated Time**: 30 minutes

---

### **HIGH PRIORITY (Important for Demo)**

#### 4. **Models Not Served by API** ⚠️
**Problem**: ONNX models exist but not accessible via HTTP
- Browser SDK needs to download models
- No `/api/v1/model/foundation.onnx` endpoint

**Current Workaround**: Copy models to `client/src/model/`
**Better Fix**: Add static file serving in FastAPI:
```python
from fastapi.staticfiles import StaticFiles
app.mount("/models", StaticFiles(directory="ml-training"), name="models")
```

**Estimated Time**: 1 hour

---

#### 5. **No LLM API Key = No AI Auditor** ⚠️
**Problem**: AI Auditor page won't work without LLM backend
- Requires DeepSeek/OpenAI/Ollama API key
- Most impressive feature won't demo

**Fix Options**:
- **Free**: Set up local Ollama (requires 8GB RAM)
- **$10 budget**: Get DeepSeek API key ($0.27/1M tokens)
- **Fallback**: Add mock responses for demo

**Estimated Time**: 1-2 hours (with API key), 3-4 hours (local Ollama)

---

#### 6. **No Visual Polish** ⚠️
**Problem**: Dashboard works but looks basic
- Charts may render blank without data
- Error states not handled gracefully
- Loading states missing

**Fix Required**:
- Add loading spinners
- Add empty state messages
- Test with fresh database
- Add sample screenshots to README

**Estimated Time**: 2-3 hours

---

### **MEDIUM PRIORITY (Nice to Have)**

#### 7. **No Demo Script** 📝
**Problem**: No structured walkthrough for interviews
- Risk of fumbling or forgetting key points
- No prepared answers for "How does this work?"

**Fix Required**: Create 5-minute demo script (see below)

**Estimated Time**: 1 hour

---

#### 8. **Slow Docker Startup** 🐢
**Problem**: Cold start takes 2-3 minutes
- Bad for live demos
- Interviewer loses interest

**Fix Required**:
- Pre-pull images: `docker-compose pull`
- Test startup beforehand
- Have backup recording

**Estimated Time**: 30 minutes

---

#### 9. **No Recorded Demo Video** 🎥
**Problem**: If live demo fails, no backup
- Network issues
- Version conflicts
- Murphy's Law

**Fix Required**: Record 3-minute screencast showing:
1. Docker startup
2. Dashboard login
3. Analytics overview
4. AI Auditor query
5. Code walkthrough

**Estimated Time**: 2 hours

---

## 📋 Prioritized Action Plan

### **Phase 1: Minimum Viable Demo (MVP)** - 6-8 hours
**Goal**: Get basic end-to-end flow working

1. ✅ **Environment Setup** (30 min)
   - Copy `env.example` to `.env`
   - Set minimal database URLs
   - Skip LLM for now (focus on analytics)

2. ✅ **Test Docker Startup** (1 hour)
   ```bash
   docker-compose up -d
   docker ps  # Verify all services running
   docker logs ux-friction-fl-genai-api-1  # Check for errors
   ```

3. ✅ **Test Dashboard Access** (30 min)
   - Navigate to `http://localhost:3000`
   - Login with `demo@zerobanner.local` / `DemoPassword123!`
   - Verify analytics data appears
   - Check that 7 days of charts render

4. ✅ **Build Client SDK** (1 hour)
   ```bash
   cd client
   pnpm install
   pnpm build
   # Copy dist to dashboard or add API endpoint
   ```

5. ✅ **Create Test Page** (2 hours)
   - Build simple HTML with SDK integration
   - Test event detection works
   - Verify events appear in dashboard

6. ✅ **Document Setup** (1 hour)
   - Write step-by-step startup guide
   - Note any gotchas
   - Create troubleshooting section

**Outcome**: Basic working demo showing analytics dashboard + SDK integration

---

### **Phase 2: Polish Demo (Full Featured)** - 8-12 hours
**Goal**: Make it impressive and robust

1. **Add LLM Integration** (2-3 hours)
   - Get DeepSeek API key (cheapest option)
   - Configure in `.env`
   - Test AI Auditor queries

2. **Visual Improvements** (2-3 hours)
   - Add loading states
   - Handle errors gracefully
   - Test with empty data
   - Add screenshots to README

3. **Create Demo Script** (1-2 hours)
   - Write 5-minute walkthrough
   - Practice explaining FL without jargon
   - Prepare answers for common questions

4. **Record Backup Video** (2-3 hours)
   - Screen record full demo
   - Add voiceover explaining architecture
   - Upload to private YouTube/Loom
   - Add link to README

5. **Stress Test** (1-2 hours)
   - Fresh database test
   - Multiple browser test
   - Network latency simulation
   - Document failure modes

**Outcome**: Production-quality demo ready for any interview

---

### **Phase 3: Advanced Features (Optional)** - 10-15 hours
**Goal**: Show advanced FL capabilities (only if time allows)

1. **Live FL Training Demo** (4-5 hours)
   - Multiple browser windows training simultaneously
   - Show model updates aggregating
   - Visualize accuracy improvement

2. **Real Website Integration** (3-4 hours)
   - Deploy to Vercel/Netlify
   - Integrate SDK on live site
   - Collect real usage data

3. **Performance Benchmarks** (2-3 hours)
   - Measure inference latency
   - Test aggregation at scale
   - Document throughput limits

4. **Security Audit** (3-4 hours)
   - Run bandit security scan
   - Test DP guarantees
   - Document privacy properties

**Outcome**: PhD-level demonstration of FL expertise

---

## 🎬 5-Minute Demo Script

### **Slide 1: Problem Statement (30 seconds)**
> "Traditional UX analytics like Google Analytics collect user data centrally. This creates privacy risks and GDPR compliance issues. 
> 
> I built PrivacyEdge to solve this using Federated Learning - the same technique Google uses for Android keyboard predictions."

---

### **Slide 2: Architecture (1 minute)**
> "Here's how it works:
> 
> 1. **Browser SDK** detects UX friction patterns - rage clicks, hesitation, confusion
> 2. **Local ML training** happens in the browser using ONNX models
> 3. **Only model updates** are sent to the server, never raw user data
> 4. **Server aggregates** updates from multiple users to improve the global model
> 5. **Dashboard** shows actionable insights without compromising privacy
> 
> Let me show you the code..." 
> 
> *(Show client SDK: event detection, local training)*
> *(Show server: aggregation algorithm, differential privacy)*

---

### **Slide 3: Live Demo (2 minutes)**
> "Let me run it locally with Docker..."
> 
> ```bash
> docker-compose up -d
> ```
> 
> *(While loading, explain)*
> "This starts 5 services: PostgreSQL for analytics storage, Redis for rate limiting, Qdrant for vector search, the FastAPI backend, and the Next.js dashboard."
> 
> *(Open dashboard)*
> "Here's the analytics dashboard. This is demo data from the last 7 days showing friction patterns."
> 
> *(Point out)*
> - Friction score trending down (good)
> - Peak rage clicks at 2-4pm (lunch hours)
> - Mobile users have 2x more friction than desktop
> 
> *(Open test page)*
> "Now let me trigger some events..."
> *(Rapid click button)*
> "The SDK detected that rage click pattern. Within seconds, it'll appear in the dashboard."
> 
> *(Refresh dashboard, show new event)*

---

### **Slide 4: AI Auditor (1 minute)**
> *(Open AI Auditor page)*
> "This is the AI-powered UX auditor. It uses a RAG pipeline with vector search to answer questions about user friction."
> 
> *(Type query)*
> "Why are users abandoning the checkout?"
> 
> *(Show response)*
> "It analyzes aggregated data and provides evidence-based recommendations. No individual user data, just patterns."

---

### **Slide 5: Technical Details (30 seconds)**
> "Key technical achievements:
> - **99%+ ML accuracy** on friction detection
> - **Differential privacy** with configurable epsilon
> - **Browser-based inference** using ONNX Runtime
> - **Multi-LLM support** (GPT-4, DeepSeek, Ollama)
> - **19 test files** covering FL aggregation, model merging, RAG pipeline
> 
> The MVP is functional. With a team, I'd love to take this to production scale - add load testing, security audits, and real customer deployments."

---

## 🐛 Common Demo Gotchas

### **Issue 1: Docker Containers Won't Start**
**Symptoms**: `docker-compose up` fails or hangs
**Fix**:
```bash
# Check port conflicts
lsof -i :8000  # API port
lsof -i :3000  # Dashboard port
lsof -i :5432  # PostgreSQL port

# Kill conflicting processes
docker-compose down -v  # Remove old volumes
docker-compose up -d --force-recreate
```

---

### **Issue 2: Dashboard Shows No Data**
**Symptoms**: Empty charts, "No projects found"
**Fix**:
```bash
# Check if demo seed ran
docker-compose logs api | grep "demo@zerobanner"

# Manually seed if needed
docker-compose exec api python -c "
from src.database import AsyncSessionLocal
from src.demo_seed import seed_demo
import asyncio
async def run():
    async with AsyncSessionLocal() as db:
        result = await seed_demo(db)
        await db.commit()
        print(result)
asyncio.run(run())
"
```

---

### **Issue 3: SDK Not Loading in Test Page**
**Symptoms**: Browser console shows 404 for SDK
**Fix**:
```bash
# Build SDK first
cd client && pnpm build

# Serve from API (add to app.py):
from fastapi.staticfiles import StaticFiles
app.mount("/sdk", StaticFiles(directory="../client/dist"), name="sdk")

# Then use: <script src="http://localhost:8000/sdk/index.js"></script>
```

---

### **Issue 4: AI Auditor Returns Errors**
**Symptoms**: "LLM backend not configured"
**Fix**:
```bash
# Add to .env
DEEPSEEK_API_KEY=your-key-here
LLM_BACKEND=deepseek

# Or use mock responses (add fallback in genai_ux_auditor.py)
```

---

## 📊 Demo Success Metrics

### **Minimum Viable Demo** ✅
- [ ] Docker starts in <2 minutes
- [ ] Dashboard loads and shows 7 days of data
- [ ] Can login with demo account
- [ ] Analytics charts render correctly
- [ ] Can create new project
- [ ] Can generate API key

### **Full Demo** ✅✅
- [ ] Client SDK loads in test page
- [ ] Events detected and sent to server
- [ ] Events appear in dashboard within 30 seconds
- [ ] AI Auditor answers questions
- [ ] Recommendations page shows actionable fixes
- [ ] No console errors in browser

### **Production-Quality Demo** ✅✅✅
- [ ] All of above works flawlessly
- [ ] Backup video recorded
- [ ] Demo script practiced 3+ times
- [ ] Can explain FL algorithm from memory
- [ ] Can answer "How would you scale this?"
- [ ] Know exact limitations and next steps

---

## 💡 Interview Questions to Prepare For

### **Technical Questions**
1. **"How does federated learning differ from normal ML?"**
   - Answer: Show aggregation code, explain privacy guarantees

2. **"What's your privacy epsilon value and why?"**
   - Answer: Configurable, default 1.0 for high privacy, explain trade-offs

3. **"How do you handle malicious clients poisoning the model?"**
   - Answer: Gradient clipping, outlier detection, client weights

4. **"What happens if a user clears their browser?"**
   - Answer: Ephemeral client ID regenerates, training continues from global model

5. **"How would you scale this to 1M users?"**
   - Answer: Kubernetes for API, horizontal DB sharding, batch aggregation

### **Product Questions**
1. **"Who would pay for this?"**
   - Answer: E-commerce sites losing revenue to UX friction, target $50-200/month SaaS

2. **"How is this better than Hotjar/FullStory?"**
   - Answer: No session replay = true privacy, GDPR compliant by default

3. **"What's missing before production?"**
   - Answer: Load testing, security audit, monitoring, customer support

---

## ⏱️ Time Estimates Summary

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| **Phase 1: MVP Demo** | Env setup, Docker test, SDK build, test page, docs | **6-8 hours** | **CRITICAL** |
| **Phase 2: Polish** | LLM integration, visual improvements, demo script, video | **8-12 hours** | **HIGH** |
| **Phase 3: Advanced** | Live FL demo, real website, benchmarks, security | **10-15 hours** | **OPTIONAL** |

**Recommended Path for Job Hunting**: 
- Complete **Phase 1** (1-2 days) → Can demo basic system
- Complete **Phase 2** (2-3 days) → Interview-ready
- Skip **Phase 3** → Focus on interview prep instead

---

## 🎯 Next Steps

1. **Read this entire document** ✅
2. **Decide on demo scope**: MVP, Polish, or Advanced?
3. **Allocate time**: Block 1-3 days for demo prep
4. **Start Phase 1**: Environment setup and Docker test
5. **Test early**: Don't wait until interview day!
6. **Practice**: Run demo 3+ times before actual interview
7. **Prepare backup**: Record video in case live demo fails

---

**Bottom Line**: You have a genuinely impressive project. With 6-8 hours of focused work, you can have a demo that will wow interviewers. The FL implementation alone puts you in the top 5% of candidates. Make it shine! 🚀
