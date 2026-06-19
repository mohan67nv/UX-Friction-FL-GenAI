-- ============================================
-- SUPABASE SCHEMA FOR ZEROBANNER-FL-GENAI
-- Generated: 2026-06-18
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================
-- TABLES
-- ============================================

-- Users table (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supabase_id UUID UNIQUE,  -- Links to auth.users.id
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_supabase_id ON users(supabase_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

COMMENT ON TABLE users IS 'Application user metadata (auth handled by Supabase)';
COMMENT ON COLUMN users.supabase_id IS 'Foreign key to auth.users.id';

-- Organizations (multi-tenancy)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'business', 'enterprise')),
    monthly_events_limit INTEGER DEFAULT 10000,
    monthly_events_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan);

COMMENT ON TABLE organizations IS 'Multi-tenant organizations';
COMMENT ON COLUMN organizations.slug IS 'URL-safe identifier (e.g., acme-corp)';
COMMENT ON COLUMN organizations.monthly_events_limit IS 'Max events per month based on plan';

-- Organization members (RBAC)
CREATE TABLE IF NOT EXISTS org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON org_members(user_id);
CREATE INDEX idx_org_members_org ON org_members(organization_id);
CREATE INDEX idx_org_members_role ON org_members(role);

COMMENT ON TABLE org_members IS 'Organization membership with role-based access control';
COMMENT ON COLUMN org_members.role IS 'owner: full control, admin: manage members, member: read/write, viewer: read-only';

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,
    privacy_mode TEXT DEFAULT 'high' CHECK (privacy_mode IN ('high', 'medium', 'low')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_domain ON projects(domain);
CREATE INDEX idx_projects_active ON projects(is_active);

COMMENT ON TABLE projects IS 'Projects belong to organizations';
COMMENT ON COLUMN projects.privacy_mode IS 'high: no PII, medium: hashed IDs, low: full tracking';

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
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
CREATE INDEX idx_api_keys_revoked ON api_keys(revoked_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_active ON api_keys(project_id, revoked_at) WHERE revoked_at IS NULL;

COMMENT ON TABLE api_keys IS 'API keys for SDK authentication';
COMMENT ON COLUMN api_keys.key_hash IS 'Hashed API key (never store plaintext)';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 8 chars for display (e.g., pe_1234...)';

-- Friction events (time-series analytics data)
CREATE TABLE IF NOT EXISTS friction_events (
    hour TEXT NOT NULL,  -- ISO 8601 hour (e.g., 2026-06-18T14:00:00Z)
    project_id UUID NOT NULL,
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'rage_click', 'hesitation', 'rapid_back', 'form_struggle',
        'error_encounter', 'dead_click', 'rage_scroll'
    )),
    event_count INTEGER DEFAULT 0,
    avg_intensity FLOAT,
    page_url_hash TEXT NOT NULL DEFAULT '',  -- Hashed URL for privacy
    top_element_hash TEXT NOT NULL DEFAULT '',  -- Hashed element selector
    device_type TEXT,
    browser_family TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (hour, project_id, metric_type, page_url_hash, top_element_hash)
);

CREATE INDEX idx_friction_events_project_hour ON friction_events(project_id, hour DESC);
CREATE INDEX idx_friction_events_metric ON friction_events(metric_type, hour DESC);
CREATE INDEX idx_friction_events_created ON friction_events(created_at DESC);

COMMENT ON TABLE friction_events IS 'Time-series friction analytics (privacy-preserving)';
COMMENT ON COLUMN friction_events.hour IS 'Hourly buckets for efficient aggregation';
COMMENT ON COLUMN friction_events.page_url_hash IS 'SHA-256 hash of URL (no PII)';

-- UX Auditor chat messages
CREATE TABLE IF NOT EXISTS ux_auditor_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB,  -- Store context, sources, confidence scores
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_project ON ux_auditor_chat_messages(project_id, created_at DESC);
CREATE INDEX idx_chat_messages_role ON ux_auditor_chat_messages(role);

COMMENT ON TABLE ux_auditor_chat_messages IS 'AI Auditor conversation history';
COMMENT ON COLUMN ux_auditor_chat_messages.metadata IS 'JSON: sources, confidence, model version';

-- Global models (Federated Learning)
CREATE TABLE IF NOT EXISTS global_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    weights JSONB NOT NULL,  -- Model weights as JSON
    num_updates INTEGER DEFAULT 0,
    performance_metrics JSONB,  -- Accuracy, loss, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, version)
);

CREATE INDEX idx_global_models_project_version ON global_models(project_id, version DESC);

COMMENT ON TABLE global_models IS 'Federated Learning global model versions';
COMMENT ON COLUMN global_models.weights IS 'Aggregated model weights from client updates';

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

-- Helper function: Get user's organizations
CREATE OR REPLACE FUNCTION user_organizations(user_uuid UUID)
RETURNS TABLE(organization_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT om.organization_id
    FROM org_members om
    JOIN users u ON u.id = om.user_id
    WHERE u.supabase_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users: Can view and update own data only
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (supabase_id = auth.uid());

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (supabase_id = auth.uid());

-- Organizations: Users can view orgs they're members of
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT
    USING (
        id IN (SELECT organization_id FROM user_organizations(auth.uid()))
    );

-- Org Members: Users can view members of their orgs
CREATE POLICY "Users can view org members" ON org_members
    FOR SELECT
    USING (
        organization_id IN (SELECT organization_id FROM user_organizations(auth.uid()))
    );

-- Owners can add/remove members
CREATE POLICY "Owners can manage org members" ON org_members
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM org_members
            WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid())
            AND role = 'owner'
        )
    );

-- Projects: Users can view projects in their orgs
CREATE POLICY "Users can view org projects" ON projects
    FOR SELECT
    USING (
        organization_id IN (SELECT organization_id FROM user_organizations(auth.uid()))
    );

-- Admins/owners can create/update projects
CREATE POLICY "Admins can manage projects" ON projects
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM org_members
            WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid())
            AND role IN ('owner', 'admin')
        )
    );

-- API Keys: Users can view keys for their projects
CREATE POLICY "Users can view project API keys" ON api_keys
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id IN (SELECT organization_id FROM user_organizations(auth.uid()))
        )
    );

-- Admins can manage API keys
CREATE POLICY "Admins can manage API keys" ON api_keys
    FOR ALL
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            JOIN org_members om ON om.organization_id = p.organization_id
            JOIN users u ON u.id = om.user_id
            WHERE u.supabase_id = auth.uid() AND om.role IN ('owner', 'admin')
        )
    );

-- Friction Events: Users can view events for their projects
CREATE POLICY "Users can view project friction events" ON friction_events
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id IN (SELECT organization_id FROM user_organizations(auth.uid()))
        )
    );

-- Service role can insert friction events (API access)
CREATE POLICY "Service role can insert friction events" ON friction_events
    FOR INSERT
    WITH CHECK (true);  -- API validates API key separately

-- Chat Messages: Users can view chats for their projects
CREATE POLICY "Users can view project chats" ON ux_auditor_chat_messages
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id IN (SELECT organization_id FROM user_organizations(auth.uid()))
        )
    );

-- Members can create chat messages
CREATE POLICY "Members can create chat messages" ON ux_auditor_chat_messages
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id IN (SELECT organization_id FROM user_organizations(auth.uid()))
        )
    );

-- Global Models: Users can view models for their projects
CREATE POLICY "Users can view project models" ON global_models
    FOR SELECT
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id IN (SELECT organization_id FROM user_organizations(auth.uid()))
        )
    );

-- Service role can manage models (FL system)
CREATE POLICY "Service role can manage models" ON global_models
    FOR ALL
    USING (true);  -- Backend handles authorization

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON org_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS (for analytics)
-- ============================================

-- Organization usage summary
CREATE OR REPLACE VIEW organization_usage AS
SELECT
    o.id,
    o.name,
    o.plan,
    o.monthly_events_limit,
    o.monthly_events_used,
    COUNT(DISTINCT p.id) as project_count,
    COUNT(DISTINCT om.user_id) as member_count,
    MAX(fe.created_at) as last_event_at
FROM organizations o
LEFT JOIN projects p ON p.organization_id = o.id
LEFT JOIN org_members om ON om.organization_id = o.id
LEFT JOIN friction_events fe ON fe.project_id = p.id
GROUP BY o.id, o.name, o.plan, o.monthly_events_limit, o.monthly_events_used;

COMMENT ON VIEW organization_usage IS 'Aggregated organization statistics';

-- Project analytics summary
CREATE OR REPLACE VIEW project_analytics AS
SELECT
    p.id as project_id,
    p.name as project_name,
    o.name as organization_name,
    COUNT(DISTINCT fe.hour) as unique_hours,
    SUM(fe.event_count) as total_events,
    COUNT(DISTINCT fe.metric_type) as metric_types,
    MAX(fe.created_at) as last_event_at,
    MIN(fe.created_at) as first_event_at
FROM projects p
JOIN organizations o ON o.id = p.organization_id
LEFT JOIN friction_events fe ON fe.project_id = p.id
GROUP BY p.id, p.name, o.name;

COMMENT ON VIEW project_analytics IS 'Per-project analytics summary';

-- ============================================
-- GRANTS (for service role)
-- ============================================

-- Service role needs full access for API operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Authenticated users get limited access (RLS policies enforce)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================
-- INITIAL DATA (optional seed data)
-- ============================================

-- Uncomment to create demo organization
-- INSERT INTO organizations (name, slug, plan) VALUES
--     ('Demo Organization', 'demo-org', 'free')
-- ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SCHEMA COMPLETE
-- ============================================

-- Verify tables created
SELECT 
    schemaname,
    tablename,
    tableowner,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
