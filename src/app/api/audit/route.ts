import { NextResponse, type NextRequest } from 'next/server';
import { createAuditRecord, runAudit } from '@/lib/auditor';
import { normalizeDomain } from '@/lib/auditor/normalize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<Response> {
  let body: { domain?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Body must be valid JSON.' },
      { status: 400 },
    );
  }

  const domain = typeof body.domain === 'string' ? body.domain : '';
  if (!domain) {
    return NextResponse.json(
      { error: 'Field "domain" is required.' },
      { status: 400 },
    );
  }

  const normalized = normalizeDomain(domain);
  if (!normalized) {
    return NextResponse.json(
      { error: 'That doesn\'t look like a valid domain.' },
      { status: 400 },
    );
  }

  const auditId = crypto.randomUUID();
  createAuditRecord(auditId, domain);

  // Kick off the audit asynchronously — don't await, let the client poll.
  void runAudit(auditId);

  return NextResponse.json({ auditId });
}
