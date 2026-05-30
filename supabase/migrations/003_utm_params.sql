-- =============================================================================
-- 003: Capture UTM parameters on audit_requests
-- =============================================================================
-- Additive nullable columns so audit-attribution (paid/organic/source/campaign)
-- can be reconstructed later. Existing rows simply have NULL across the board;
-- the start route now reads UTM params from the browser URL and persists them.

ALTER TABLE audit_requests ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE audit_requests ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE audit_requests ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE audit_requests ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE audit_requests ADD COLUMN IF NOT EXISTS utm_term TEXT;
