import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

const unlockSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().max(254).email(),
});

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ auditId: string }> },
): Promise<Response> {
  const { auditId } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = unlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { name, email } = parsed.data;
  const supabase = getSupabase();

  const { data: audit } = await supabase
    .from('audit_requests')
    .select('id')
    .eq('id', auditId)
    .maybeSingle();

  if (!audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  try {
    await supabase
      .from('audit_requests')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', auditId);
  } catch {
    /* ignore */
  }

  console.log('LEAD_CAPTURED:', JSON.stringify({ auditId, name, email }));

  return NextResponse.json({ success: true });
}
