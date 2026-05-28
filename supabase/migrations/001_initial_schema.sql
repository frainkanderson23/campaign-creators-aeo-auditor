-- =============================================================================
-- AEO Auditor: Initial Database Schema
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 2. profiles
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. handle_new_user trigger function + error log table
-- -----------------------------------------------------------------------------
CREATE TABLE _handle_new_user_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO _handle_new_user_errors (user_id, error_message)
  VALUES (NEW.id, SQLERRM);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. audit_requests
-- -----------------------------------------------------------------------------
CREATE TABLE audit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_requests_user_id ON audit_requests (user_id);
CREATE INDEX idx_audit_requests_status ON audit_requests (status);
CREATE INDEX idx_audit_requests_created_at ON audit_requests (created_at DESC);

-- -----------------------------------------------------------------------------
-- 5. audit_results
-- -----------------------------------------------------------------------------
CREATE TABLE audit_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_request_id UUID NOT NULL REFERENCES audit_requests(id) ON DELETE CASCADE,
  answerability_score INTEGER,
  answerability_grade TEXT,
  structure_score INTEGER,
  structure_grade TEXT,
  trust_score INTEGER,
  trust_grade TEXT,
  freshness_score INTEGER,
  freshness_grade TEXT,
  brevity_score INTEGER,
  brevity_grade TEXT,
  overall_score INTEGER,
  overall_grade TEXT,
  raw_findings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (audit_request_id)
);

CREATE INDEX idx_audit_results_audit_request_id ON audit_results (audit_request_id);

-- -----------------------------------------------------------------------------
-- 6. leads
-- -----------------------------------------------------------------------------
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_request_id UUID NOT NULL REFERENCES audit_requests(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_leads_email_audit_request_id_unique
  ON leads (email, audit_request_id);

-- -----------------------------------------------------------------------------
-- 7. ip_rate_limit_log
-- -----------------------------------------------------------------------------
CREATE TABLE ip_rate_limit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  audit_request_id UUID REFERENCES audit_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ip_rate_limit_log_ip_address ON ip_rate_limit_log (ip_address);
CREATE INDEX idx_ip_rate_limit_log_created_at ON ip_rate_limit_log (created_at DESC);

-- -----------------------------------------------------------------------------
-- 8. Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_rate_limit_log ENABLE ROW LEVEL SECURITY;

-- audit_requests: anon SELECT allowed; authenticated own rows
CREATE POLICY anon_select_audit_requests
  ON audit_requests
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY authenticated_all_own_audit_requests
  ON audit_requests
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- audit_results: anon SELECT allowed; authenticated SELECT all
CREATE POLICY anon_select_audit_results
  ON audit_results
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY authenticated_select_audit_results
  ON audit_results
  FOR SELECT
  TO authenticated
  USING (true);

-- leads: NO anon access; authenticated full access
CREATE POLICY authenticated_only_leads
  ON leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ip_rate_limit_log: service_role only
CREATE POLICY service_role_only_ip_rate_limit_log
  ON ip_rate_limit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 9. audit_summary view
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW audit_summary AS
SELECT
  ar.id AS audit_request_id,
  ar.url,
  ar.status,
  ar.created_at AS requested_at,
  res.overall_score,
  res.overall_grade,
  res.answerability_score,
  res.answerability_grade,
  res.structure_score,
  res.structure_grade,
  res.trust_score,
  res.trust_grade,
  res.freshness_score,
  res.freshness_grade,
  res.brevity_score,
  res.brevity_grade
FROM audit_requests ar
LEFT JOIN audit_results res ON res.audit_request_id = ar.id;
