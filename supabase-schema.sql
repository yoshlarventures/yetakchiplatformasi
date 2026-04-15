-- Supabase Schema for Yoshlar Yetakchilari Platformasi
-- Run this SQL in Supabase Dashboard -> SQL Editor

-- Teams jadvali
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region_id TEXT NOT NULL,
  hackathon_id TEXT,
  project_id TEXT,
  members JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects jadvali
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  team_id TEXT,
  region_id TEXT NOT NULL,
  hackathon_id TEXT,
  status TEXT DEFAULT 'draft',
  attachments JSONB DEFAULT '[]',
  history JSONB DEFAULT '[]',
  is_approved_by_director BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMPTZ,
  approval_notes TEXT,
  rejection_reason TEXT,
  rejection_date TIMESTAMPTZ,
  revision_notes TEXT,
  assigned_partner TEXT,
  partner_type TEXT,
  allocated_budget NUMERIC,
  budget_currency TEXT DEFAULT 'UZS',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) o'chirish - hamma o'qiy va yoza olsin
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Hamma uchun ruxsat
CREATE POLICY "Allow all for teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for projects" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Realtime uchun
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
