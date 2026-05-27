import { NextResponse, type NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
  );
}

const startSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (v) => {
        try {
          const u = new URL(v);
          return u.protocol === 'http:' || u.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'URL must use http or https protocol' },
    ),
});

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') {
    return true;
  }

  if (h.endsWith('.local') || h.endsWith('.internal')) {
    return true;
  }

  // Reject any IPv6 (we deliberately block bracket IPv6 literals)
  if (hostname.startsWith('[') || h.includes(':')) {
    return true;
  }

  // Reject raw IPv4 literals (e.g. "8.8.8.8") and check private ranges
  if (IPV4_RE.test(h)) {
    const parts = h.split('.').map((p) => Number.parseInt(p, 10));
    if (parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
      return true;
    }
    return true;
  }

  // Reject purely numeric octet-style hostnames just in case
  if (/^\d+(\.\d+)*$/.test(h)) {
    return true;
  }

  return false;
}

function normalizeUrl(input: string): string {
  const u = new URL(input);
  return `https://${u.hostname}`;
}

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export async function POST(request: NextRequest): Promise<Response> {
  const ip = getClientIp(request);

  try {
    const { limited } = await checkRateLimit(ip);
    if (limited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfterSeconds: 3600 },
        { status: 429, headers: { 'Retry-After': '3600' } },
      );
    }
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
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

  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message).join('; ');
    return NextResponse.json({ error: messages }, { status: 400 });
  }

  let hostname: string;
  try {
    hostname = new URL(parsed.data.url).hostname;
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (isBlockedHost(hostname)) {
    return NextResponse.json(
      { error: 'Invalid URL: private/local addresses are not permitted' },
      { status: 400 },
    );
  }

  const normalizedUrl = normalizeUrl(parsed.data.url);

  let auditId: string;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('audit_requests')
      .insert({
        url: normalizedUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    auditId = data.id as string;
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  void fetch(
    new URL(
      '/api/audit/crawl',
      process.env.NEXT_PUBLIC_APP_URL!.trim(),
    ).toString(),
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.INTERNAL_CRAWLER_SECRET!.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ auditId, url: normalizedUrl }),
    },
  ).catch(() => {
    // Fire-and-forget; failures are logged elsewhere by the crawler.
  });

  return NextResponse.json({ auditId }, { status: 201 });
}
