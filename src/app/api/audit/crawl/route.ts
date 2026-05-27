import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { load as loadHtml } from 'cheerio';
import { runAllScorers } from '@/lib/scoring';
import type { CrawledPage, RobotsData } from '@/types/crawl';

export const maxDuration = 60;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BOT_NAMES = ['GPTBot', 'ClaudeBot', 'Googlebot', 'Bingbot'] as const;

const crawlSchema = z.object({
  auditId: z.string().uuid(),
  domainUrl: z.string().url(),
});

function emptyCrawledPage(url: string, error: string, statusCode = 0): CrawledPage {
  return {
    url,
    title: '',
    metaDescription: '',
    h1: [],
    h2: [],
    canonicalUrl: '',
    structuredData: [],
    wordCount: 0,
    internalLinks: [],
    externalLinks: [],
    images: [],
    statusCode,
    fetchError: error,
  };
}

function parseRobotsTxt(text: string): RobotsData {
  const lines = text.split(/\r?\n/).map((l) => l.trim());

  type Block = { agents: string[]; disallows: string[] };
  const blocks: Block[] = [];
  let current: Block | null = null;
  let lastWasUserAgent = false;

  for (const raw of lines) {
    const line = raw.split('#')[0].trim();
    if (!line) {
      lastWasUserAgent = false;
      continue;
    }
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (field === 'user-agent') {
      if (!current || !lastWasUserAgent) {
        current = { agents: [], disallows: [] };
        blocks.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasUserAgent = true;
    } else if (field === 'disallow') {
      if (current) current.disallows.push(value);
      lastWasUserAgent = false;
    } else {
      lastWasUserAgent = false;
    }
  }

  const result: RobotsData = {};
  for (const bot of BOT_NAMES) {
    const botLower = bot.toLowerCase();
    const matchingBlocks = blocks.filter(
      (b) => b.agents.includes(botLower) || b.agents.includes('*'),
    );
    const specific = blocks.filter((b) => b.agents.includes(botLower));
    const applicable = specific.length > 0 ? specific : matchingBlocks;

    let allowed = true;
    for (const block of applicable) {
      if (block.disallows.some((d) => d === '/')) {
        allowed = false;
        break;
      }
    }
    result[bot] = { allowed };
  }
  return result;
}

function parseSitemapUrls(xml: string, limit = 20): string[] {
  const urls: string[] = [];
  const locRegex = /<loc>\s*([^<\s][^<]*?)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = locRegex.exec(xml)) !== null) {
    const url = match[1].trim();
    if (url) urls.push(url);
    if (urls.length >= limit) break;
  }
  return urls;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  return fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'follow',
  });
}

async function fetchRobots(domainUrl: string): Promise<RobotsData> {
  const empty: RobotsData = {};
  for (const bot of BOT_NAMES) empty[bot] = { allowed: true };
  try {
    const res = await fetchWithTimeout(`${domainUrl}/robots.txt`, 8000);
    if (!res.ok) return empty;
    const text = await res.text();
    return parseRobotsTxt(text);
  } catch {
    return empty;
  }
}

async function fetchSitemap(domainUrl: string): Promise<string[]> {
  try {
    const res = await fetchWithTimeout(`${domainUrl}/sitemap.xml`, 8000);
    if (!res.ok) return [];
    const xml = await res.text();
    return parseSitemapUrls(xml, 20);
  } catch {
    return [];
  }
}

async function crawlPage(
  url: string,
  domainUrl: string,
): Promise<CrawledPage> {
  try {
    const res = await fetchWithTimeout(url, 10000);
    const statusCode = res.status;
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('text/html')) {
      return emptyCrawledPage(url, 'Skipped: non-HTML content', statusCode);
    }

    const html = await res.text();
    const $ = loadHtml(html);

    const title = $('title').first().text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') ?? '';
    const h1 = $('h1')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    const h2 = $('h2')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    const canonicalUrl = $('link[rel="canonical"]').attr('href') ?? '';

    const structuredData: object[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      const raw = $(el).contents().text();
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') structuredData.push(parsed);
      } catch {
        // ignore invalid JSON-LD blocks
      }
    });

    const bodyText = $('body').text().trim();
    const wordCount = bodyText.length === 0 ? 0 : bodyText.split(/\s+/).length;

    const internalLinks: string[] = [];
    const externalLinks: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      if (href.startsWith(domainUrl) || href.startsWith('/')) {
        internalLinks.push(href);
      } else if (href.startsWith('http')) {
        externalLinks.push(href);
      }
    });

    const images = $('img')
      .map((_, el) => ({
        src: $(el).attr('src') ?? '',
        alt: $(el).attr('alt') ?? '',
      }))
      .get();

    return {
      url,
      title,
      metaDescription,
      h1,
      h2,
      canonicalUrl,
      structuredData,
      wordCount,
      internalLinks,
      externalLinks,
      images,
      statusCode,
      fetchError: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return emptyCrawledPage(url, message, 0);
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  const authHeader = req.headers.get('authorization') ?? '';
  const expected = process.env.INTERNAL_CRAWLER_SECRET;
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';
  if (!expected || !token || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid payload', details: 'Body must be valid JSON.' },
      { status: 400 },
    );
  }

  const parsed = crawlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    );
  }
  const { auditId, domainUrl } = parsed.data;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
  );

  await supabase
    .from('audits')
    .update({ status: 'processing' })
    .eq('id', auditId);

  try {
    const robotsData = await fetchRobots(domainUrl);
    const sitemapUrls = await fetchSitemap(domainUrl);

    const seedUrls = Array.from(
      new Set([domainUrl, ...sitemapUrls]),
    ).slice(0, 5);

    const crawledPages: CrawledPage[] = [];
    for (const url of seedUrls) {
      await new Promise((r) => setTimeout(r, 500));
      const page = await crawlPage(url, domainUrl);
      crawledPages.push(page);
    }

    const { scores, recommendations, overallScore } = runAllScorers({
      crawledPages,
      robotsData,
      sitemapUrls,
      domainUrl,
    });

    await supabase
      .from('audit_results')
      .upsert(
        {
          audit_id: auditId,
          scores,
          recommendations,
          overall_score: overallScore,
          crawled_pages: crawledPages,
          robots_data: robotsData,
          sitemap_urls: sitemapUrls,
        },
        { onConflict: 'audit_id' },
      );

    await supabase
      .from('audits')
      .update({ status: 'complete', completed_at: new Date().toISOString() })
      .eq('id', auditId);

    return NextResponse.json(
      { success: true, auditId, overallScore },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await supabase
      .from('audits')
      .update({ status: 'failed', error_message: message })
      .eq('id', auditId);
    return NextResponse.json({ error: 'Crawl failed' }, { status: 500 });
  }
}
