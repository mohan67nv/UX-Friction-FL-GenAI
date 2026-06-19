-- Demo/Seed Data for Development
-- Run this after initial migration to populate test data

-- Example organization
INSERT INTO organizations (id, name, slug, plan, monthly_events_limit)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Organization', 'demo-org', 'free', 10000)
ON CONFLICT (id) DO NOTHING;

-- Example project
INSERT INTO projects (id, org_id, name, slug, api_key_prefix)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Demo Project', 'demo-project', 'demo')
ON CONFLICT (id) DO NOTHING;

-- More seed data can be added here
