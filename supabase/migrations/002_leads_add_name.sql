-- =============================================================================
-- 002: Add name to leads table + ip_address to audit_requests
-- =============================================================================

-- Add name column to leads (nullable for backward compat with any existing rows)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS name TEXT;

-- Add ip_address to audit_requests if not present (used by rate limiter already
-- but not in the original migration)
ALTER TABLE audit_requests ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Allow service_role INSERT on leads (the unlock route uses service_role key)
CREATE POLICY service_role_insert_leads
  ON leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
