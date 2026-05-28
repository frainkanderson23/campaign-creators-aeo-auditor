import { NextResponse, type NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { generatePreviewInsights } from '@/src/lib/audit/insights';
import type { RawFindings } from '@/src/types/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let client: SupabaseClient | undefined;
function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
    );
  }
  return client;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AuditStatus = 'pending' | 'processing' | 'complete' | 'failed';

interface AuditRequestRow {
  id: string;
  status: AuditStatus;
  url: string;
}

interface AuditResultRow {
  answerability_score: number | null;
  answerability_grade: string | null;
  structure_score: number | null;
  structure_grade: string | null;
  trust_score: number | null;
  trust_grade: string | null;
  freshness_score: number | null;
  freshness_grade: string | null;
  brevity_score: number | null;
  brevity_grade: string | null;
  overall_score: number | null;
  overall_grade: string | null;
  raw_findings: RawFindings | null;
}

interface CategoryEntry {
  score: number | null;
  grade: string | null;
}

type Categories = Record<string, CategoryEntry>;

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

    const { data: requestData, error: requestError } = await supabase
      .from('audit_requests')
      .select('id, status, url')
      .eq('id', auditId)
      .maybeSingle();

    if (requestError) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }

    if (!requestData) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const audit = requestData as unknown as AuditRequestRow;
    const domain_url = audit.url;

    if (audit.status === 'pending' || audit.status === 'processing') {
      return NextResponse.json({
        auditId,
        status: audit.status,
        domain_url,
      });
    }

    if (audit.status === 'failed') {
      return NextResponse.json({
        auditId,
        status: 'failed',
        domain_url,
        error: null,
      });
    }

    const { data: resultData, error: resultsError } = await supabase
      .from('audit_results')
      .select(
        'answerability_score, answerability_grade, structure_score, structure_grade, trust_score, trust_grade, freshness_score, freshness_grade, brevity_score, brevity_grade, overall_score, overall_grade, raw_findings',
      )
      .eq('audit_request_id', auditId)
      .maybeSingle();

    if (resultsError) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }

    if (!resultData) {
      return NextResponse.json(
        { error: 'Audit result data not found' },
        { status: 500 },
      );
    }

    const result = resultData as unknown as AuditResultRow;

    const categories: Categories = {
      answerability: {
        score: result.answerability_score,
        grade: result.answerability_grade,
      },
      structure: {
        score: result.structure_score,
        grade: result.structure_grade,
      },
      trust: { score: result.trust_score, grade: result.trust_grade },
      freshness: {
        score: result.freshness_score,
        grade: result.freshness_grade,
      },
      brevity: { score: result.brevity_score, grade: result.brevity_grade },
      overall: { score: result.overall_score, grade: result.overall_grade },
    };

    const preview_insights = result.raw_findings
      ? generatePreviewInsights(result.raw_findings).slice(0, 3)
      : [];

    return NextResponse.json({
      auditId,
      status: 'complete',
      domain_url,
      categories,
      preview_insights,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
