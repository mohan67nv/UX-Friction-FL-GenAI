# Supabase Migration Setup Guide

## ✅ Phase 1: Database Migration - COMPLETED

All backend code has been updated to support Supabase:

### Files Modified:
- ✅ `server/requirements.txt` - Added supabase==2.11.0
- ✅ `server/src/supabase_client.py` - Supabase client management
- ✅ `server/src/auth.py` - Supabase authentication integration
- ✅ `server/src/app.py` - Updated auth endpoints
- ✅ `.env` - Supabase credentials configured

### Next Steps:

#### 1. Execute Database Schema in Supabase (15 minutes)

The schema file `supabase_schema.sql` (419 lines) contains:
- 8 tables with proper structure
- RLS policies for multi-tenancy
- Indexes for performance
- Triggers for updated_at timestamps
- Helper functions and analytics views

**To execute:**

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/egwjnhrxwmorcwnvjzja/sql
   ```

2. Copy the entire contents of `supabase_schema.sql`

3. Paste into the SQL Editor

4. Click **"Run"** button

5. Verify in Table Editor that 8 tables were created:
   - users
   - organizations
   - org_members
   - projects
   - api_keys
   - friction_events
   - ux_auditor_chat_messages
   - global_models

---

## ✅ Phase 2: Authentication Integration - COMPLETED

All authentication code has been implemented:

### Backend Changes:
- ✅ `register_with_supabase()` - Creates user in Supabase Auth
- ✅ `login_with_supabase()` - Authenticates via Supabase
- ✅ `get_current_user()` - Supports both Supabase and legacy JWT
- ✅ Backward compatible with existing authentication

### Frontend Changes:
- ✅ `dashboard/app/lib/supabase.ts` - Supabase client
- ✅ `dashboard/app/lib/auth-context.tsx` - Auth provider with OAuth
- ✅ `dashboard/app/auth/callback/page.tsx` - OAuth callback handler
- ✅ `dashboard/app/login/page.tsx` - Updated with Google & GitHub OAuth buttons
- ✅ `dashboard/app/signup/page.tsx` - Updated with OAuth and email verification
- ✅ `dashboard/app/layout.tsx` - Wrapped in AuthProvider

### Next Steps:

#### 2. Configure OAuth Providers in Supabase (20 minutes)

**Google OAuth:**

1. Go to: https://supabase.com/dashboard/project/egwjnhrxwmorcwnvjzja/auth/providers

2. Find **Google** provider and click **Enable**

3. Create Google OAuth credentials:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click **Create Credentials** → **OAuth 2.0 Client IDs**
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     https://egwjnhrxwmorcwnvjzja.supabase.co/auth/v1/callback
     http://localhost:3001/auth/callback (for development)
     ```
   - Copy **Client ID** and **Client Secret**

4. Back in Supabase, paste:
   - **Client ID** → Client ID field
   - **Client Secret** → Client Secret field

5. Click **Save**

**GitHub OAuth:**

1. In same Supabase Auth Providers page, find **GitHub** and click **Enable**

2. Create GitHub OAuth App:
   - Go to: https://github.com/settings/developers
   - Click **New OAuth App**
   - Application name: `UX Friction Platform` (or your choice)
   - Homepage URL: `http://localhost:3001` (for dev)
   - Authorization callback URL:
     ```
     https://egwjnhrxwmorcwnvjzja.supabase.co/auth/v1/callback
     ```
   - Copy **Client ID** and **Client Secret**

3. Back in Supabase, paste:
   - **Client ID** → Client ID field
   - **Client Secret** → Client Secret field

4. Click **Save**

---

## ✅ Phase 3: UI Redesign - COMPLETED

All UI components have been created with Supabase-style design:

### Files Created/Modified:
- ✅ `dashboard/app/components/Sidebar.tsx` - Supabase-style left sidebar
- ✅ `dashboard/app/app/layout.tsx` - Updated to use Sidebar component

### Design Features:
- Dark theme matching Supabase aesthetics
  - Background: `#0E1117`
  - Sidebar: `#1A1F2E`
  - Borders: `#2E3440`
  - Text: `#C9D1D9`
  - Accent: `#3ECF8E` (Supabase green)
- Collapsible sidebar (240px ↔ 64px)
- Navigation items with icons:
  - 📊 Overview
  - 📈 Analytics
  - 🤖 AI Auditor
  - 👥 Team Members
  - 🔑 API Keys
  - ⚙️ Settings
- User menu with email display and sign out
- Top bar with "Dashboard" title and "FREE PLAN" badge

### Optional Enhancements (not required):
- [ ] Update remaining pages with dark theme
- [ ] Add dark mode toggle
- [ ] Custom loading spinners
- [ ] Toast notifications

---

## 🔄 Current Status: Containers Building

Docker containers are being rebuilt with all Supabase dependencies. Once complete, the application will be ready to test.

---

## 🧪 Testing Checklist (After OAuth Configuration)

### 1. Email/Password Authentication
- [ ] Open http://localhost:3001/signup
- [ ] Register with email/password
- [ ] Verify "Check your email!" screen appears
- [ ] (Optional) Check email for verification link
- [ ] Login with same credentials at http://localhost:3001/login
- [ ] Verify redirects to `/app` with new sidebar

### 2. Google OAuth
- [ ] Click "Continue with Google" on login page
- [ ] Verify redirects to Google login
- [ ] Authorize application
- [ ] Verify redirects back to `/app` with sidebar

### 3. GitHub OAuth
- [ ] Click "Continue with GitHub" on login page
- [ ] Verify redirects to GitHub authorization
- [ ] Authorize application
- [ ] Verify redirects back to `/app` with sidebar

### 4. UI/UX Testing
- [ ] Verify sidebar appears on left (dark theme)
- [ ] Click collapse button (↔ icon)
- [ ] Verify sidebar collapses to 64px width
- [ ] Test all navigation links (Overview, Analytics, etc.)
- [ ] Verify user email displays in user menu
- [ ] Click "Sign Out" and verify redirects to login

### 5. Session Persistence
- [ ] Login and close browser
- [ ] Reopen http://localhost:3001
- [ ] Verify still logged in (should redirect to `/app`)

### 6. Multi-tenancy
- [ ] Create 2 accounts
- [ ] Verify each account has separate data
- [ ] Verify RLS prevents cross-account access

---

## 🐛 Troubleshooting

### Supabase Connection Issues
- Verify `.env` has correct credentials
- Check Supabase project is not paused (free tier auto-pauses after inactivity)
- Test connection: https://egwjnhrxwmorcwnvjzja.supabase.co/rest/v1/

### OAuth Not Working
- Verify OAuth providers are **enabled** in Supabase dashboard
- Verify redirect URLs match exactly (no trailing slashes)
- Check browser console for errors
- Verify Client ID/Secret are correct

### Database Schema Not Applied
- Check Supabase SQL Editor for error messages
- Verify no syntax errors in `supabase_schema.sql`
- Try running sections one at a time if full file fails

### Containers Not Starting
- Check logs: `docker compose logs -f api`
- Verify no port conflicts (8002, 3001, 6333, 6379)
- Rebuild: `docker compose down && docker compose up -d --build`

---

## 📝 Environment Variables Reference

All credentials are already configured in `.env`:

```bash
# Supabase Project
SUPABASE_PROJECT_ID=egwjnhrxwmorcwnvjzja
SUPABASE_URL=https://egwjnhrxwmorcwnvjzja.supabase.co

# Frontend (Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://egwjnhrxwmorcwnvjzja.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>

# Backend (FastAPI)
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>
SUPABASE_JWT_SECRET=<YOUR_SUPABASE_JWT_SECRET>
```

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] Update OAuth redirect URLs to production domain
- [ ] Update CORS origins in `server/src/app.py`
- [ ] Set up custom domain in Supabase (optional)
- [ ] Configure email templates in Supabase (Auth → Email Templates)
- [ ] Enable Rate Limiting in Supabase (Auth → Settings)
- [ ] Set up monitoring alerts
- [ ] Configure backup schedule
- [ ] Review and update RLS policies if needed
- [ ] Load test authentication flow
- [ ] Security audit of API endpoints

---

## 📚 Additional Resources

- Supabase Documentation: https://supabase.com/docs
- Supabase Auth Guide: https://supabase.com/docs/guides/auth
- OAuth Setup: https://supabase.com/docs/guides/auth/social-login
- RLS Policies: https://supabase.com/docs/guides/auth/row-level-security
- Supabase Python Client: https://supabase.com/docs/reference/python

---

## 🎉 Summary

**All 3 phases are now code-complete:**

✅ **Phase 1: Database Migration**
- Backend Supabase integration
- Schema SQL generated (419 lines)
- Hybrid auth (Supabase + legacy)

✅ **Phase 2: Authentication**
- OAuth (Google + GitHub)
- Email verification
- React auth context
- Backward compatible

✅ **Phase 3: UI Redesign**
- Supabase-style dark theme
- Collapsible sidebar
- User menu with sign out

**Remaining steps:**
1. Execute `supabase_schema.sql` in Supabase SQL Editor (15 min)
2. Configure OAuth providers (Google, GitHub) (20 min)
3. Wait for Docker containers to finish building
4. Test authentication flows (30 min)

**Total time to complete setup: ~1 hour**
