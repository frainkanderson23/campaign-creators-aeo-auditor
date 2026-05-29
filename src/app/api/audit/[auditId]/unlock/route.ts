import { NextResponse, type NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { generatePreviewInsights } from '@/src/lib/audit/insights';
import { upsertContact } from '@/src/lib/hubspot';
import type { RawFindings } from '@/src/types/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let client: SupabaseClient | undefined;
function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return client;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const unlockSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .email(),
});

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

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ auditId: string }> },
): Promise<Response> {
  const { auditId } = await ctx.params;

  if (!UUID_REGEX.test(auditId)) {
    return NextResponse.json({ error: 'Invalid auditId' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Body must be valid JSON.' },
      { status: 400 },
    );
  }

  const parsed = unlockSchema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message).join('; ');
    return NextResponse.json({ error: messages }, { status: 400 });
  }
  const { name, email } = parsed.data;

  try {
    const supabase = getSupabase();

    const { data: requestData, error: requestError } = await supabase
      .from('audit_requests')
      .select('id, status, url')
      .eq('id', auditId)
      .eq('status', 'complete')
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

    const { error: leadError } = await supabase
      .from('leads')
      .upsert(
        { audit_request_id: auditId, name, email },
        { onConflict: 'email,audit_request_id' },
      );

    if (leadError) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }

    void upsertContact(email).catch(() => {});

    const { data: resultData, error: resultsError } = await supabase
      .from('audit_results')
      .select(
        'answerability_score, answerability_grade, structure_score, structure_grade, trust_score, trust_grade, freshness_score, freshness_grade, brevity_score, brevity_grade, overall_score, overall_grade, raw_findings',
      )
      .eq('audit_request_id', auditId)
      .maybeSingle();

    if (resultsError || !resultData) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }

    const result = resultData as unknown as AuditResultRow;

    const categories = {
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

    const insights = result.raw_findings
      ? generatePreviewInsights(result.raw_findings)
      : [];

    return NextResponse.json({
      auditId,
      status: 'complete',
      domain_url: audit.url,
      categories,
      insights,
      raw_findings: result.raw_findings,
      unlocked: true,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
