# 🔐 Authentication & Security Analysis

**Last Updated:** June 18, 2026  
**Status:** MVP → Production Hardening Required

---

## 📊 **Current Implementation Analysis**

### ✅ **What's Already Implemented (Good Foundation)**

#### **1. Core Authentication (JWT-based)**
```python
# Location: server/src/auth.py
```

**Strengths:**
- ✅ JWT tokens with expiration (24 hours default)
- ✅ Password hashing with `pbkdf2_sha256` (secure, compatible)
- ✅ Bearer token authentication via FastAPI HTTPBearer
- ✅ Token validation on protected routes
- ✅ User ID and email in JWT payload

**Implementation:**
```python
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 24

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
```

#### **2. User Management**
```python
# Location: server/src/database.py - User model
```

**Schema:**
```sql
users:
  - id (UUID primary key)
  - email (unique, indexed)
  - password_hash (pbkdf2_sha256)
  - name (optional)
  - email_verified (boolean, default false)
  - created_at (timestamp)
  - last_login (timestamp)
```

**Strengths:**
- ✅ Email uniqueness enforced at DB level
- ✅ Password hashes stored securely (never plaintext)
- ✅ Email verification field (not yet enforced)
- ✅ Audit timestamps (created_at, last_login)

#### **3. Multi-Tenant Architecture**
```python
# Location: server/src/database.py - Organization, OrgMember, Project models
```

**Schema:**
```
organizations:
  - id, name, slug (unique)
  - plan (free/pro/enterprise)
  - monthly_events_limit, monthly_events_used
  - created_at

org_members:
  - organization_id, user_id (unique constraint)
  - role (owner/admin/member/viewer)
  - created_at

projects:
  - id, organization_id
  - name, domain
  - privacy_mode (standard/high/maximum)
  - is_active
  - created_at
```

**Strengths:**
- ✅ Proper multi-tenant isolation (org → projects)
- ✅ Role-based access control (RBAC) foundation
- ✅ Usage limits enforced at org level
- ✅ Soft-delete support (is_active flag)

#### **4. API Key Authentication**
```python
# Location: server/src/database.py - APIKey model
```

**Schema:**
```sql
api_keys:
  - id, project_id
  - key_hash (SHA-256 of full key)
  - key_prefix (first 8 chars, for UI display)
  - name (user-friendly label)
  - created_at, last_used_at, revoked_at
```

**Strengths:**
- ✅ Keys hashed before storage (never plaintext)
- ✅ Key prefix for identification
- ✅ Revocation support (revoked_at timestamp)
- ✅ Last used tracking
- ✅ Project-scoped (not user-scoped)

#### **5. Role-Based Access Control (RBAC)**
```python
# Location: server/src/rbac.py
```

**Permissions:**
```python
ROLE_PERMS = {
    "owner": {"read", "write", "delete", "manage_billing", "manage_members", "manage_keys"},
    "admin": {"read", "write", "delete", "manage_members", "manage_keys"},
    "member": {"read", "write"},
    "viewer": {"read"},
}
```

**Strengths:**
- ✅ Clear permission hierarchy
- ✅ Owner has all permissions
- ✅ Granular permissions (billing, members, keys)
- ✅ Easy to extend with new permissions

#### **6. Registration & Login Flow**
```python
# Location: server/src/app.py
```

**Features:**
- ✅ `/auth/register` - Creates user + optional org
- ✅ `/auth/login` - Validates credentials, returns JWT
- ✅ Auto-bootstrap: Creates default org + project on signup
- ✅ Prevents duplicate email registration (409 Conflict)
- ✅ Invalid credentials return generic error (no user enumeration)

---

## ⚠️ **Security Gaps & Production Requirements**

### 🔴 **CRITICAL (Must Fix Before Production)**

#### **1. No Email Verification**
**Current State:**
- `email_verified` field exists but never set to `true`
- Users can register with any email (including fake ones)
- No email confirmation flow

**Risk:**
- ❌ Bots can create unlimited accounts
- ❌ Spam/abuse risk
- ❌ No way to recover accounts (password reset requires verified email)
- ❌ Violates GDPR/CCPA (can't prove consent if email invalid)

**Fix Required:**
```python
# Need to implement:
1. Send verification email on registration (SendGrid/AWS SES/Postmark)
2. Generate secure token (UUID + expiry)
3. Verify email endpoint: /auth/verify-email?token=...
4. Block dashboard access until email verified
5. Resend verification email endpoint
```

#### **2. No Password Reset/Forgot Password**
**Current State:**
- No way to recover account if password forgotten
- Users permanently locked out

**Risk:**
- ❌ Poor user experience
- ❌ Support burden (manual password resets)
- ❌ Security issue (users may reuse weak passwords)

**Fix Required:**
```python
# Need to implement:
1. /auth/forgot-password (email) → sends reset link
2. /auth/reset-password (token, new_password) → validates token, updates password
3. Token expiry (15-30 minutes)
4. Rate limiting (prevent email bombing)
5. Invalidate old tokens on password change
```

#### **3. Weak JWT Secret Default**
**Current State:**
```python
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
```

**Risk:**
- ❌ If deployed with default secret, anyone can forge tokens
- ❌ Complete authentication bypass

**Fix Required:**
```bash
# Generate strong secret (32+ random bytes)
openssl rand -hex 32

# Store in .env (NEVER commit to git)
JWT_SECRET=8f7a9b2c4e1d6f3a9c8b7e6d5c4a3b2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6

# Fail startup if not set in production
if os.getenv("ENVIRONMENT") == "production" and JWT_SECRET == "dev-secret-change-in-prod":
    raise ValueError("JWT_SECRET must be set in production!")
```

#### **4. No Rate Limiting on Auth Endpoints**
**Current State:**
- Unlimited login attempts
- Unlimited registration attempts
- Unlimited API key creation

**Risk:**
- ❌ Brute-force password attacks
- ❌ Credential stuffing attacks
- ❌ Email bombing (verification emails)
- ❌ Resource exhaustion (DB, email service)

**Fix Required:**
```python
# Option 1: Redis-based rate limiting (SlowAPI)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")  # 5 attempts per minute per IP
async def login(...):
    ...

@app.post("/auth/register")
@limiter.limit("3/hour")  # 3 registrations per hour per IP
async def register(...):
    ...

# Option 2: Database-based (track failed attempts by email)
# Lock account after 5 failed attempts for 15 minutes
```

#### **5. No Session Management/Token Revocation**
**Current State:**
- JWTs valid until expiry (24 hours)
- No way to invalidate tokens early
- Logout = delete token client-side (insecure)

**Risk:**
- ❌ Stolen token usable until expiry
- ❌ User cannot force logout from all devices
- ❌ No way to revoke compromised tokens

**Fix Required:**
```python
# Option 1: Token blacklist (Redis)
# Store revoked tokens in Redis with TTL = token expiry
# Check blacklist on every protected route

# Option 2: Short-lived access tokens + refresh tokens
# Access token: 15 minutes (short-lived)
# Refresh token: 7 days (stored in DB, can be revoked)
# Client exchanges refresh token for new access token
```

#### **6. No OAuth/SSO Support**
**Current State:**
- Only email/password authentication
- No Google/GitHub/Microsoft login

**Risk:**
- ❌ Users prefer social login (convenience)
- ❌ Weaker passwords (users create weak passwords vs. OAuth)
- ❌ No SSO for enterprises (deal-breaker for B2B)

**Fix Required:**
```python
# Use authlib or FastAPI-Users
from authlib.integrations.starlette_client import OAuth

oauth = OAuth()

oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@app.get("/auth/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token['userinfo']
    # Create or login user with Google ID
```

---

### 🟡 **HIGH PRIORITY (Security Hardening)**

#### **7. No HTTPS Enforcement**
**Current State:**
- API allows HTTP connections
- Tokens transmitted in plaintext over HTTP

**Risk:**
- ❌ Man-in-the-middle attacks (token interception)
- ❌ Session hijacking

**Fix Required:**
```python
# Add HTTPS redirect middleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

# Set secure cookie flags (if using cookies)
response.set_cookie(
    key="access_token",
    value=token,
    secure=True,      # HTTPS only
    httponly=True,    # No JavaScript access
    samesite="strict" # CSRF protection
)
```

#### **8. No CORS Configuration for Production**
**Current State:**
```python
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
```

**Risk:**
- ❌ Any origin can make requests (CSRF risk)
- ❌ Credential leakage to malicious sites

**Fix Required:**
```python
# Strict CORS for production
ALLOWED_ORIGINS = [
    "https://app.privacyedge.com",
    "https://dashboard.privacyedge.com",
    # NO wildcards in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,  # Allow cookies/auth headers
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

#### **9. No Input Validation/Sanitization**
**Current State:**
- Pydantic validates types but not content
- No email format validation
- No password strength requirements

**Risk:**
- ❌ SQL injection (mitigated by SQLAlchemy, but defense-in-depth)
- ❌ XSS attacks (stored in DB, reflected in dashboard)
- ❌ Weak passwords

**Fix Required:**
```python
from pydantic import EmailStr, validator
import re

class RegisterRequest(BaseModel):
    email: EmailStr  # Validates email format
    password: str
    name: str | None = None
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 12:
            raise ValueError('Password must be at least 12 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain special character')
        return v
    
    @validator('name')
    def sanitize_name(cls, v):
        if v:
            # Remove HTML tags, trim whitespace
            v = re.sub(r'<[^>]*>', '', v).strip()
            if len(v) > 100:
                raise ValueError('Name too long')
        return v
```

#### **10. No 2FA/MFA Support**
**Current State:**
- Only password authentication
- No second factor

**Risk:**
- ❌ Phishing attacks succeed if password compromised
- ❌ Not compliant with security standards (SOC 2, ISO 27001)

**Fix Required:**
```python
# Use pyotp for TOTP (Google Authenticator)
import pyotp

class User(Base):
    # Add columns
    totp_secret: Mapped[str | None] = mapped_column(String(32), nullable=True)
    totp_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

@app.post("/auth/2fa/setup")
async def setup_2fa(user: dict = Depends(get_current_user)):
    secret = pyotp.random_base32()
    # Store secret encrypted
    # Return QR code for user to scan
    
@app.post("/auth/2fa/verify")
async def verify_2fa(code: str, user: dict = Depends(get_current_user)):
    totp = pyotp.TOTP(user['totp_secret'])
    if not totp.verify(code, valid_window=1):
        raise HTTPException(401, "Invalid 2FA code")
```

---

### 🟢 **MEDIUM PRIORITY (Improvements)**

#### **11. No Account Lockout After Failed Attempts**
**Fix:** Track failed login attempts, lock account after 5 failures for 15 minutes.

#### **12. No Audit Logging**
**Fix:** Log all auth events (login, logout, password change, API key creation) with IP, timestamp, user agent.

#### **13. No Password Change Endpoint**
**Fix:** Allow users to change password (requires current password verification).

#### **14. No Delete Account**
**Fix:** GDPR requires "right to be forgotten" - users must be able to delete their accounts.

#### **15. No Terms of Service / Privacy Policy Acceptance**
**Fix:** Require checkbox on registration, store acceptance timestamp in DB.

---

## 🏗️ **Recommended Architecture: Production-Grade Auth**

### **Option 1: Roll Your Own (Current + Enhancements)**

**Pros:**
- ✅ Full control
- ✅ No vendor lock-in
- ✅ No additional costs
- ✅ Already 60% complete

**Cons:**
- ❌ Significant dev time (2-3 weeks)
- ❌ Ongoing maintenance burden
- ❌ Security expertise required
- ❌ Compliance certifications harder

**Estimated Effort:**
- Email verification: 8 hours
- Password reset: 6 hours
- Rate limiting: 4 hours
- OAuth (Google/GitHub): 12 hours
- 2FA: 8 hours
- Session management: 6 hours
- Security hardening: 8 hours
- Testing: 16 hours
- **Total: ~68 hours (~2 weeks)**

---

### **Option 2: Supabase Auth (Recommended for MVP → Production)**

**What is Supabase?**
- Open-source Firebase alternative
- Managed PostgreSQL + Auth + Storage + Realtime
- Built on top of proven tools (PostgreSQL, PostgREST, GoTrue)

**Why Supabase Auth?**
```
✅ Email/password auth (built-in)
✅ OAuth (Google, GitHub, Azure, etc.) (built-in)
✅ Magic links (passwordless) (built-in)
✅ Email verification (built-in)
✅ Password reset (built-in)
✅ Rate limiting (built-in)
✅ Row-level security (RLS) for multi-tenant
✅ JWT tokens (same as current implementation)
✅ Admin API for user management
✅ Free tier: 50,000 MAU
✅ Self-hostable (Docker) or cloud-hosted
```

**Migration Path:**
```python
# 1. Keep existing User/Organization/Project models
# 2. Add supabase_id column to User table
# 3. Use Supabase for auth, PostgreSQL for app data
# 4. Single sign-on: Supabase JWT → validate → lookup user in app DB

from supabase import create_client, Client

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

@app.post("/auth/register")
async def register(email: str, password: str):
    # Register with Supabase
    res = supabase.auth.sign_up({
        "email": email,
        "password": password
    })
    
    # Create user in app database
    user = await crud.create_user(db, email, supabase_id=res.user.id)
    
    return {"message": "Check your email to verify"}

@app.post("/auth/login")
async def login(email: str, password: str):
    res = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    
    # Return Supabase JWT (same format as current)
    return {"access_token": res.session.access_token}

# Middleware: Validate Supabase JWT
async def get_current_user(token: str):
    user = supabase.auth.get_user(token)
    # Lookup in app DB by supabase_id
    return await crud.get_user_by_supabase_id(db, user.id)
```

**Estimated Effort:**
- Supabase setup: 2 hours
- Migrate auth endpoints: 4 hours
- Update frontend to use Supabase SDK: 6 hours
- Testing: 8 hours
- **Total: ~20 hours (~2.5 days)**

**Cost:**
- Free tier: 50,000 monthly active users
- Pro tier: $25/month (100,000 MAU, 8GB storage, email support)
- Self-hosted: $0 (but you manage infrastructure)

---

### **Option 3: Auth0/Clerk/WorkOS (Enterprise-Grade)**

**When to use:**
- B2B SaaS targeting enterprises
- Need SAML/SCIM for SSO
- Need compliance certifications (SOC 2, ISO 27001)
- Have budget ($25-$1200/month)

**Pros:**
- ✅ Enterprise SSO (SAML, LDAP)
- ✅ SOC 2 Type II certified
- ✅ White-label login pages
- ✅ Advanced security (anomaly detection, breached password detection)
- ✅ Compliance reports

**Cons:**
- ❌ Expensive ($25-$1200/month)
- ❌ Vendor lock-in
- ❌ Less control

**Recommendation for PrivacyEdge:**
- **Not yet** - Wait until you have enterprise customers demanding SSO
- Start with Supabase, migrate to Auth0/Clerk later if needed

---

## 🎯 **Recommended Implementation Plan**

### **Phase 1: Security Hardening (Current System) - 1 Week**

**Priority: CRITICAL before any production users**

1. **Generate Strong JWT Secret** (15 min)
   ```bash
   openssl rand -hex 32 > .jwt_secret
   echo "JWT_SECRET=$(cat .jwt_secret)" >> .env
   ```

2. **Add Email Verification** (1 day)
   - Use SendGrid/Postmark (free tier: 100 emails/day)
   - Generate verification tokens (UUID + 24h expiry)
   - Block dashboard access until verified
   - Resend verification endpoint

3. **Add Password Reset** (1 day)
   - Forgot password endpoint
   - Reset password endpoint
   - Email templates (HTML + plaintext)
   - Token expiry (30 minutes)

4. **Add Rate Limiting** (0.5 day)
   - Install SlowAPI: `pip install slowapi`
   - Add limits:
     - Login: 5/minute per IP
     - Register: 3/hour per IP
     - Password reset: 3/hour per email
     - API key creation: 10/hour per user

5. **Improve Input Validation** (0.5 day)
   - Email format validation (EmailStr)
   - Password strength requirements (12+ chars, complexity)
   - Sanitize all text inputs (strip HTML)

6. **Add Security Headers** (1 hour)
   ```python
   from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
   from starlette.middleware.trustedhost import TrustedHostMiddleware
   
   app.add_middleware(HTTPSRedirectMiddleware)
   app.add_middleware(TrustedHostMiddleware, allowed_hosts=["privacyedge.com", "*.privacyedge.com"])
   
   @app.middleware("http")
   async def add_security_headers(request, call_next):
       response = await call_next(request)
       response.headers["X-Content-Type-Options"] = "nosniff"
       response.headers["X-Frame-Options"] = "DENY"
       response.headers["X-XSS-Protection"] = "1; mode=block"
       response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
       return response
   ```

7. **Strict CORS Configuration** (30 min)
   ```python
   # .env
   ALLOWED_ORIGINS=https://app.privacyedge.com,https://dashboard.privacyedge.com
   
   # app.py
   origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[o.strip() for o in origins if o.strip()],
       allow_credentials=True,
       allow_methods=["GET", "POST", "PUT", "DELETE"],
       allow_headers=["Authorization", "Content-Type"],
   )
   ```

8. **Testing & Documentation** (1 day)
   - Write tests for all auth flows
   - Update API docs
   - Create security.md with implemented measures

**Deliverables:**
- ✅ Email verification working
- ✅ Password reset working
- ✅ Rate limiting active
- ✅ Strong JWT secret in production
- ✅ Secure headers configured
- ✅ Test coverage >80% for auth

---

### **Phase 2: OAuth Integration - 1 Week**

**Priority: HIGH for user experience**

1. **Setup OAuth Providers** (1 day)
   - Register apps with Google, GitHub
   - Get client IDs and secrets
   - Configure redirect URLs

2. **Implement OAuth Flow** (2 days)
   - Install authlib: `pip install authlib`
   - Add OAuth endpoints
   - Link OAuth accounts to existing users
   - Handle new user creation from OAuth

3. **Frontend Integration** (2 days)
   - Add "Sign in with Google" button
   - Add "Sign in with GitHub" button
   - Update dashboard login page

4. **Testing** (1 day)
   - Test OAuth flows
   - Test account linking
   - Test edge cases

**Deliverables:**
- ✅ Google OAuth working
- ✅ GitHub OAuth working
- ✅ Users can link multiple OAuth accounts
- ✅ Dashboard shows connected accounts

---

### **Phase 3: Advanced Security Features - 1 Week**

**Priority: MEDIUM (nice-to-have for MVP)**

1. **2FA/TOTP Support** (2 days)
   - Install pyotp: `pip install pyotp qrcode`
   - 2FA setup endpoint (generate QR code)
   - 2FA verification on login
   - Backup codes generation

2. **Session Management** (2 days)
   - Refresh token implementation
   - Active sessions list in dashboard
   - Logout from all devices

3. **Audit Logging** (1 day)
   - Create audit_log table
   - Log all auth events
   - Dashboard to view audit log

4. **Account Lockout** (1 day)
   - Track failed login attempts
   - Lock account after 5 failures
   - Auto-unlock after 15 minutes

5. **Testing** (1 day)

**Deliverables:**
- ✅ 2FA optional for users
- ✅ Users can see active sessions
- ✅ Audit log shows all security events
- ✅ Account lockout prevents brute force

---

### **Phase 4: Supabase Migration (Alternative) - 3 Days**

**If choosing Supabase instead of Phases 1-3:**

1. **Supabase Setup** (0.5 day)
   - Create Supabase project
   - Configure auth providers
   - Set up email templates

2. **Schema Migration** (1 day)
   - Add supabase_id to users table
   - Create migration script
   - Test data migration

3. **Backend Integration** (1 day)
   - Install supabase-py
   - Update auth endpoints
   - Update get_current_user middleware

4. **Frontend Integration** (0.5 day)
   - Install @supabase/supabase-js
   - Update login/register pages
   - Update auth state management

5. **Testing** (1 day)
   - Test all auth flows
   - Test existing users
   - Load testing

**Deliverables:**
- ✅ All auth handled by Supabase
- ✅ Email verification automatic
- ✅ OAuth working (Google, GitHub)
- ✅ Existing users migrated
- ✅ App data still in PostgreSQL

---

## 📋 **Decision Matrix**

| Feature | Current | Phase 1-3 | Supabase | Auth0/Clerk |
|---------|---------|-----------|----------|-------------|
| **Email/Password** | ✅ | ✅ | ✅ | ✅ |
| **Email Verification** | ❌ | ✅ | ✅ | ✅ |
| **Password Reset** | ❌ | ✅ | ✅ | ✅ |
| **OAuth (Google/GitHub)** | ❌ | ✅ | ✅ | ✅ |
| **2FA** | ❌ | ✅ | ✅ | ✅ |
| **Rate Limiting** | ❌ | ✅ | ✅ | ✅ |
| **Session Management** | ❌ | ✅ | ✅ | ✅ |
| **Enterprise SSO** | ❌ | ❌ | ❌ | ✅ |
| **SOC 2 Certified** | ❌ | ❌ | ❌ | ✅ |
| **Dev Time** | - | 3 weeks | 3 days | 1 week |
| **Monthly Cost** | $0 | $0 | $0-$25 | $25-$1200 |
| **Maintenance** | - | High | Low | Very Low |
| **Control** | ✅ | ✅ | Medium | Low |

---

## 🎯 **My Recommendation for PrivacyEdge**

### **For MVP → First 100 Users:**
**Go with Supabase Auth (Phase 4)**

**Reasoning:**
1. **Speed to market:** 3 days vs 3 weeks
2. **Lower risk:** Battle-tested by thousands of apps
3. **Better UX:** Email verification, password reset, OAuth work out-of-the-box
4. **Lower maintenance:** No auth code to maintain
5. **Cost:** Free up to 50K MAU (you won't hit this for months)
6. **Flexibility:** Can self-host later if needed
7. **Privacy-friendly:** Open-source, EU hosting available

**When to migrate away:**
- If you hit 50K MAU (then you have revenue to pay for Auth0)
- If you need enterprise SSO (then migrate to WorkOS)
- If you want 100% control (then implement Phase 1-3)

---

### **Immediate Action Items (This Week):**

1. **Fix JWT Secret** (15 min)
   ```bash
   openssl rand -hex 32 >> .env
   # Update docker-compose.yml to load from .env
   ```

2. **Add Rate Limiting** (2 hours)
   ```bash
   pip install slowapi
   # Add to app.py
   ```

3. **Decide: Supabase vs Roll-Your-Own** (discussion)
   - If Supabase: Start Phase 4 this week
   - If roll-your-own: Start Phase 1 this week

4. **Create GitHub Issue for Auth Hardening** (30 min)
   - Use this document as reference
   - Assign to yourself
   - Set milestone: "Production MVP"

---

## 📚 **Resources**

### **Security Best Practices:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- NIST Password Guidelines: https://pages.nist.gov/800-63-3/

### **Implementation Guides:**
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725

### **Tools:**
- SendGrid (emails): https://sendgrid.com
- Postmark (emails): https://postmarkapp.com
- SlowAPI (rate limiting): https://github.com/laurentS/slowapi
- Authlib (OAuth): https://authlib.org
- Supabase: https://supabase.com

---

## ✅ **Production Readiness Checklist**

Before going live, ensure:

**Authentication:**
- [ ] JWT secret is cryptographically random (32+ bytes)
- [ ] Email verification required before dashboard access
- [ ] Password reset flow tested and working
- [ ] Rate limiting on all auth endpoints
- [ ] Account lockout after failed attempts
- [ ] OAuth (at least Google) working
- [ ] Password strength requirements enforced
- [ ] Session management (can logout from all devices)

**Security:**
- [ ] HTTPS enforced (no HTTP allowed)
- [ ] CORS restricted to production domains only
- [ ] Security headers set (HSTS, X-Frame-Options, etc.)
- [ ] Input validation on all endpoints
- [ ] SQL injection tests passed (SQLAlchemy mitigates, but test)
- [ ] XSS tests passed (sanitize all user inputs)
- [ ] CSRF protection (SameSite cookies)

**Compliance:**
- [ ] Privacy policy written and linked
- [ ] Terms of service written and linked
- [ ] User consent tracked (checkbox on signup)
- [ ] GDPR right to be forgotten (delete account)
- [ ] Data retention policy defined
- [ ] Security incident response plan

**Monitoring:**
- [ ] Failed login attempts logged
- [ ] Suspicious activity alerts (many failed logins)
- [ ] Auth event audit log
- [ ] Uptime monitoring (PagerDuty/Sentry)
- [ ] Error tracking (Sentry)

**Testing:**
- [ ] Auth flow integration tests
- [ ] Security tests (OWASP Top 10)
- [ ] Load testing (Locust/k6)
- [ ] Penetration testing (HackerOne/Bugcrowd)

---

**Questions? Discuss with team before implementing!**
