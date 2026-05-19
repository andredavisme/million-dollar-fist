-- Million Dollar Fist — Initial Schema
-- Supabase Project: andredavisme's Project (hhyhulqngdkwsxhymmcd)

-- Communities
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  region TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  population INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Fund Pools
CREATE TABLE IF NOT EXISTS fund_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  total_raised NUMERIC(15,2) DEFAULT 0,
  disbursement_period TEXT, -- e.g. 'Q1-2026'
  status TEXT DEFAULT 'active', -- active | disbursed | pending
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (fund allocation targets)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- food | education | housing | hygiene | health | business | emergency | investment | resident_payout | business_payout
  allocation_percent NUMERIC(5,2) NOT NULL,
  obligation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disbursements
CREATE TABLE IF NOT EXISTS disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_pool_id UUID REFERENCES fund_pools(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  amount NUMERIC(15,2) NOT NULL,
  disbursed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Households
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Businesses
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Payout Eligibility Tracking
CREATE TABLE IF NOT EXISTS payout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disbursement_id UUID REFERENCES disbursements(id),
  recipient_type TEXT NOT NULL, -- household | business
  recipient_id UUID NOT NULL,
  amount NUMERIC(15,2),
  accepted BOOLEAN DEFAULT TRUE,
  rolled_over_to UUID, -- references another payout_record if declined
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_records ENABLE ROW LEVEL SECURITY;

-- Public read policies (education platform — data is transparent)
CREATE POLICY "Public read communities" ON communities FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read disbursements" ON disbursements FOR SELECT USING (true);
CREATE POLICY "Public read fund_pools" ON fund_pools FOR SELECT USING (true);
