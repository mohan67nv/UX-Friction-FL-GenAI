# Supabase Project Structure

This directory contains all Supabase-related configurations, migrations, and functions.

## 📁 Structure

```
supabase/
├── config.toml              # Supabase project configuration
├── migrations/              # Database migrations (versioned SQL files)
│   └── 20260618000000_initial_schema.sql
├── functions/               # Edge Functions (serverless TypeScript/JavaScript)
├── seed/                    # Seed data for development/testing
│   └── demo_data.sql
└── README.md               # This file
```

## 🗄️ Migrations

Database migrations are stored in `migrations/` with timestamp-based naming:

- `20260618000000_initial_schema.sql` - Initial database schema with tables, RLS policies, indexes

### Creating New Migrations

```bash
# Using Supabase CLI
supabase migration new <migration_name>

# Manual
# Create file: migrations/YYYYMMDDHHMMSS_description.sql
```

### Running Migrations

**Option 1: Supabase SQL Editor (Recommended for initial setup)**
1. Go to https://supabase.com/dashboard/project/egwjnhrxwmorcwnvjzja/sql
2. Copy contents of migration file
3. Paste and click "Run"

**Option 2: Supabase CLI**
```bash
supabase db push
```

**Option 3: Manual psql**
```bash
psql "postgresql://postgres.[PROJECT_ID].supabase.co:5432/postgres" -f migrations/YYYYMMDDHHMMSS_file.sql
```

## 🔐 Environment Variables

Make sure these are set in your `.env` file:

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

## 🌱 Seed Data

Development seed data is in `seed/demo_data.sql`. Run after migrations:

```sql
-- In Supabase SQL Editor
\i seed/demo_data.sql
```

Or copy-paste the contents into SQL Editor.

## ⚡ Edge Functions

Supabase Edge Functions (Deno runtime) go in `functions/`:

```bash
supabase functions new my-function
```

Example structure:
```
functions/
├── my-function/
│   └── index.ts
└── another-function/
    └── index.ts
```

## 📚 Resources

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🚀 Quick Start

1. **Install Supabase CLI** (optional but recommended):
   ```bash
   npm install -g supabase
   ```

2. **Link to project**:
   ```bash
   supabase link --project-ref egwjnhrxwmorcwnvjzja
   ```

3. **Run migrations**:
   ```bash
   supabase db push
   ```

4. **Seed data**:
   ```bash
   psql $DATABASE_URL -f supabase/seed/demo_data.sql
   ```

## 🔄 Workflow

### Making Schema Changes

1. Create new migration file
2. Write SQL changes
3. Test locally (if using local Supabase)
4. Push to production via SQL Editor or CLI
5. Commit migration file to git

### Best Practices

- ✅ Use migrations for all schema changes
- ✅ Never edit production database directly
- ✅ Test migrations on staging first
- ✅ Keep migrations small and atomic
- ✅ Add comments to complex queries
- ✅ Use RLS policies for security
- ✅ Version control all migration files
