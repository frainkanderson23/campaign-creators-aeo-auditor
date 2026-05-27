import { NextResponse, type NextRequest } from 'next/server';
import { auditStore } from '@/lib/auditor/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/audit/[id]'>,
): Promise<Response> {
  const { id } = await ctx.params;
  const record = auditStore.get(id);

  if (!record) {
    return NextResponse.json({ error: 'Audit not found.' }, { status: 404 });
  }

  return NextResponse.json(record);
}
