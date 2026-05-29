# HubSpot Setup for AEO Auditor Integration

## 1. Create a Private App

1. Go to **HubSpot** → **Settings** → **Integrations** → **Private Apps**
2. Click **Create a private app**
3. Name: `AEO Auditor`
4. Description: `Syncs AEO audit leads from aeo.campaigncreators.com`
5. Under **Scopes**, enable:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.schemas.contacts.read` (needed for property auto-creation)
   - `crm.schemas.contacts.write` (needed for property auto-creation)
6. Click **Create app**
7. Copy the access token

## 2. Add the Token to Vercel

Add this environment variable in Vercel (campaign-creators-aeo-auditor project):

| Key | Value |
|-----|-------|
| `HUBSPOT_PRIVATE_APP_TOKEN` | `pat-na1-xxxxx...` (the token from step 1) |

Redeploy after adding.

## 3. Custom Properties — Auto-Created

**You do NOT need to manually create properties.** On the first lead sync, the integration automatically:

1. Creates an "AEO Audit Data" property group
2. Creates all 14 custom properties in that group

Properties created:

| Internal name | Label | Type |
|---|---|---|
| `aeo_overall_score` | AEO Overall Score | Number |
| `aeo_overall_grade` | AEO Overall Grade | Text |
| `aeo_audit_url` | AEO Audit Report URL | Text |
| `aeo_answerability_score` | AEO Crawlability Score | Number |
| `aeo_structure_score` | AEO Structure Score | Number |
| `aeo_trust_score` | AEO Trust Score | Number |
| `aeo_freshness_score` | AEO Freshness Score | Number |
| `aeo_schema_score` | AEO Schema Score | Number |
| `aeo_engines_cited` | AEO Engines Cited | Text |
| `aeo_engines_missing` | AEO Engines Missing | Text |
| `aeo_citation_rate` | AEO Citation Rate | Text |
| `aeo_top_weakness` | AEO Top Weakness | Text |
| `aeo_audit_date` | AEO Audit Date | Date |
| `aeo_lead_source` | AEO Lead Source | Text |

The bootstrap is idempotent — it checks what exists and only creates what's missing. It runs once per server instance (cached in memory after first run).

## 4. Standard Properties Used (already exist in HubSpot)

- `firstname` — split from full name
- `lastname` — split from full name
- `email` — from email gate
- `website` — the domain that was audited
- `lifecyclestage` — set to "lead"
- `hs_lead_status` — set to "NEW"

## 5. How It Works

1. User runs an AEO audit on `aeo.campaigncreators.com`
2. Audit completes (crawl → AI probes → scoring)
3. User enters name + email to unlock the full report
4. The unlock route:
   - Saves the lead to the `leads` table in Supabase
   - On first call: auto-creates HubSpot property group + properties
   - Upserts the HubSpot contact with all AEO data (async, non-blocking)
5. If `HUBSPOT_PRIVATE_APP_TOKEN` is not set, HubSpot sync is silently skipped

## 6. Verifying It Works

After setup, run a test audit and unlock it with a test email. Then:
1. Check the `leads` table in Supabase — should have a row with name + email
2. Check HubSpot Contacts — search for the test email
3. On the contact record, look for the **AEO Audit Data** property group
4. All scores, grades, engine citations, and the report URL should be populated

## 7. CRM Card (Optional but Recommended)

A custom CRM card consolidates all AEO data into one visual section on the contact sidebar. See the `aeo-hubspot-card/` project README for deployment instructions.
