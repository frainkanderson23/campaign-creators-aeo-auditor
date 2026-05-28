import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { AuditResultPage, type AuditRequestRow, type AuditResultRow } from '@/components/aeo/AuditResultPage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let _supabase: ReturnType<typeof createClient> | undefined;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
    );
  }
  return _supabase;
}

type PageProps = { params: Promise<{ auditId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { auditId } = await params;
  const supabase = getSupabase();
  const { data } = await supabase
    .from('audit_requests')
    .select('url')
    .eq('id', auditId)
    .maybeSingle();
  const domain = data?.url
    ? (() => { try { return new URL(data.url).hostname; } catch { return data.url; } })()
    : 'AEO Report';
  return { title: `AEO Report — ${domain} | Campaign Creators` };
}

export default async function AuditResultRoute({ params }: PageProps) {
  const { auditId } = await params;

  const supabase = getSupabase();

  const { data: requestRaw } = await supabase
    .from('audit_requests')
    .select('id, url, status, email, created_at')
    .eq('id', auditId)
    .maybeSingle();

  if (!requestRaw) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#374151' }}>
          Audit not found
        </h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          The audit ID you provided doesn't exist or has expired.
        </p>
      </div>
    );
  }

  const requestData = requestRaw as AuditRequestRow;

  if (requestData.status === 'pending' || requestData.status === 'processing') {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <svg
            style={{ animation: 'spin 1s linear infinite', width: 48, height: 48, color: '#1d4ed8', margin: '0 auto', display: 'block' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827' }}>
          Audit in progress…
        </h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem', maxWidth: 360, margin: '0.5rem auto 0' }}>
          We're analysing <strong>
            {(() => { try { return new URL(requestData.url).hostname; } catch { return requestData.url; } })()}
          </strong> across all AEO dimensions. This usually takes 30–60 seconds.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '1rem' }}>
          This page will show your results automatically once the audit completes.
        </p>
      </div>
    );
  }

  if (requestData.status === 'failed') {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#374151' }}>
          Audit failed
        </h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Something went wrong analysing this domain. Please try again.
        </p>
        <a href="/" style={{ marginTop: '1.5rem', display: 'inline-block', padding: '0.6rem 1.2rem', background: '#1d4ed8', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
          Run a new audit
        </a>
      </div>
    );
  }

  const { data: resultRaw } = await supabase
    .from('audit_results')
    .select(
      'id, audit_request_id, overall_score, overall_grade, answerability_score, answerability_grade, brevity_score, brevity_grade, trust_score, trust_grade, structure_score, structure_grade, freshness_score, freshness_grade, created_at',
    )
    .eq('audit_request_id', auditId)
    .maybeSingle();

  if (!resultRaw) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#374151' }}>
          Results not ready yet
        </h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          The audit completed but results are still being processed. Please refresh in a moment.
        </p>
      </div>
    );
  }

  return (
    <AuditResultPage
      requestData={requestData}
      auditData={resultRaw as AuditResultRow}
    />
  );
}