-- =============================================================================
-- AEO Auditor: Initial Database Schema
-- =============================================================================
-- This migration creates the full initial schema for the AEO Auditor
-- application, including tables, indexes, triggers, RLS policies, and views.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Table: profiles
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table: audit_requests
-- -----------------------------------------------------------------------------
CREATE TABLE audit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_requests_status ON audit_requests (status);
CREATE INDEX idx_audit_requests_user_id ON audit_requests (user_id);
CREATE INDEX idx_audit_requests_created_at ON audit_requests (created_at DESC);

-- -----------------------------------------------------------------------------
-- Table: audit_results
-- -----------------------------------------------------------------------------
CREATE TABLE audit_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_request_id UUID NOT NULL REFERENCES audit_requests(id) ON DELETE CASCADE,
  schema_markup_score NUMERIC(5,2),
  schema_markup_grade TEXT,
  content_quality_score NUMERIC(5,2),
  content_quality_grade TEXT,
  technical_seo_score NUMERIC(5,2),
  technical_seo_grade TEXT,
  site_authority_score NUMERIC(5,2),
  site_authority_grade TEXT,
  llm_visibility_score NUMERIC(5,2),
  llm_visibility_grade TEXT,
  overall_score NUMERIC(5,2),
  overall_grade TEXT,
  raw_findings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_audit_results_audit_request_id UNIQUE (audit_request_id)
);

CREATE INDEX idx_audit_results_audit_request_id ON audit_results (audit_request_id);

-- -----------------------------------------------------------------------------
-- Table: leads
-- -----------------------------------------------------------------------------
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  audit_request_id UUID REFERENCES audit_requests(id) ON DELETE SET NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_leads_email_audit_request_id_unique
  ON leads (email, audit_request_id);
CREATE INDEX idx_leads_email ON leads (email);

-- -----------------------------------------------------------------------------
-- Table: ip_rate_limit_log
-- -----------------------------------------------------------------------------
CREATE TABLE ip_rate_limit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL DEFAULT '/api/audit/start',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ip_rate_limit_log_ip_requested_at
  ON ip_rate_limit_log (ip_address, requested_at DESC);

-- -----------------------------------------------------------------------------
-- Table: _handle_new_user_errors (error log for the handle_new_user trigger)
-- -----------------------------------------------------------------------------
CREATE TABLE _handle_new_user_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Function & Trigger: handle_new_user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO _handle_new_user_errors (user_id, error_message)
  VALUES (NEW.id, SQLERRM);
  RAISE;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_rate_limit_log ENABLE ROW LEVEL SECURITY;

-- audit_requests policies
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

-- audit_results policies
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

-- profiles policies
CREATE POLICY authenticated_select_own_profile
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY authenticated_update_own_profile
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- leads policies
-- No anon policies. service_role implicitly bypasses RLS.
CREATE POLICY authenticated_insert_leads
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ip_rate_limit_log policies
-- No anon or authenticated policies; service_role implicitly bypasses RLS.

-- -----------------------------------------------------------------------------
-- View: audit_summary
-- -----------------------------------------------------------------------------
CREATE VIEW audit_summary AS
SELECT
  ar.id AS audit_request_id,
  ar.url,
  ar.status,
  ar.created_at AS requested_at,
  res.overall_score,
  res.overall_grade,
  res.schema_markup_score,
  res.schema_markup_grade,
  res.content_quality_score,
  res.content_quality_grade,
  res.technical_seo_score,
  res.technical_seo_grade,
  res.site_authority_score,
  res.site_authority_grade,
  res.llm_visibility_score,
  res.llm_visibility_grade
FROM audit_requests ar
LEFT JOIN audit_results res ON res.audit_request_id = ar.id;

GRANT SELECT ON audit_summary TO anon;
GRANT SELECT ON audit_summary TO authenticated;
