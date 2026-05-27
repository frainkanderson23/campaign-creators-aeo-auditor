import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  generatePreviewInsights,
  type Categories,
  type CategoryFinding,
} from '@/src/lib/audit/insights';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase(): ReturnType<typeof createClient> {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AuditStatus = 'pending' | 'processing' | 'complete' | 'failed';

interface AuditRequestRow {
  id: string;
  status: AuditStatus;
  domain_url: string;
  error: string | null;
}

interface AuditResultRow {
  category: string;
  score: number;
  findings: CategoryFinding[] | null;
}

interface PendingResponse {
  auditId: string;
  status: 'pending' | 'processing';
  domain_url: string;
}

interface FailedResponse {
  auditId: string;
  status: 'failed';
  domain_url: string;
  error: string | null;
}

interface CompleteResponse {
  auditId: string;
  status: 'complete';
  domain_url: string;
  categories: Categories;
  preview_insights: string[];
}

type StatusResponse = PendingResponse | FailedResponse | CompleteResponse;

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/audit/[auditId]/status'>,
): Promise<Response> {
  const { auditId } = await ctx.params;

  if (!UUID_REGEX.test(auditId)) {
    return NextResponse.json({ error: 'Invalid auditId' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data: row, error: requestError } = await supabase
      .from('audit_requests')
      .select('id, status, domain_url, error')
      .eq('id', auditId)
      .maybeSingle();

    if (requestError) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }

    if (!row) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const audit = row as unknown as AuditRequestRow;

    if (audit.status === 'pending' || audit.status === 'processing') {
      const response: PendingResponse = {
        auditId,
        status: audit.status,
        domain_url: audit.domain_url,
      };
      return NextResponse.json(response);
    }

    if (audit.status === 'failed') {
      const response: FailedResponse = {
        auditId,
        status: 'failed',
        domain_url: audit.domain_url,
        error: audit.error,
      };
      return NextResponse.json(response);
    }

    const { data: resultRows, error: resultsError } = await supabase
      .from('audit_results')
      .select('category, score, findings')
      .eq('audit_request_id', auditId);

    if (resultsError) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }

    const categories: Categories = {};
    for (const r of (resultRows ?? []) as unknown as AuditResultRow[]) {
      if (!r || typeof r.category !== 'string') continue;
      categories[r.category] = {
        score: typeof r.score === 'number' ? r.score : 0,
        findings: Array.isArray(r.findings) ? r.findings : [],
      };
    }

    const preview_insights = generatePreviewInsights(categories).slice(0, 3);

    const response: CompleteResponse = {
      auditId,
      status: 'complete',
      domain_url: audit.domain_url,
      categories,
      preview_insights,
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export type { StatusResponse };
