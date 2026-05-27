import * as cheerio from 'cheerio';
import { fetchResource } from '@/lib/auditor/fetch';
import { scoreToGrade, type CheckResult, type Finding } from '@/lib/types';

async function pageExists(url: string): Promise<boolean> {
  const res = await fetchResource(url, { method: 'HEAD' });
  if (res && res.ok) return true;
  // Some sites don't allow HEAD; fall back to GET.
  const getRes = await fetchResource(url);
  return !!(getRes && getRes.ok);
}

function hasAuthorInJsonLd(html: string): boolean {
  const $ = cheerio.load(html);
  let found = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (found) return;
    const raw = $(el).contents().text();
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      found = walkForAuthor(parsed);
    } catch {
      // ignore parse errors
    }
  });
  return found;
}

function walkForAuthor(node: unknown): boolean {
  if (!node) return false;
  if (Array.isArray(node)) return node.some(walkForAuthor);
  if (typeof node !== 'object') return false;
  const obj = node as Record<string, unknown>;
  if ('author' in obj && obj.author) return true;
  if ('@type' in obj && obj['@type'] === 'Person') return true;
  for (const value of Object.values(obj)) {
    if (walkForAuthor(value)) return true;
  }
  return false;
}

export async function runAuthorityCheck(
  origin: string,
): Promise<Omit<CheckResult, 'id' | 'label' | 'status'>> {
  const findings: Finding[] = [];
  const recommendations: string[] = [];

  const [homepage, aboutRes, aboutUsRes, contactRes, contactUsRes] =
    await Promise.all([
      fetchResource(origin),
      pageExists(`${origin}/about`),
      pageExists(`${origin}/about-us`),
      pageExists(`${origin}/contact`),
      pageExists(`${origin}/contact-us`),
    ]);

  let score = 0;

  // 1. About page — 30 pts
  if (aboutRes || aboutUsRes) {
    score += 30;
    findings.push({
      severity: 'info',
      text: 'An About page is reachable — AI assistants use this to summarize who you are.',
    });
  } else {
    findings.push({
      severity: 'critical',
      text: 'No /about or /about-us page found. AI assistants have nowhere to ground claims about your company.',
    });
    recommendations.push(
      'Publish an About page at /about that names the founders, the year founded, and a one-paragraph mission.',
    );
  }

  // 2. Contact page — 20 pts
  if (contactRes || contactUsRes) {
    score += 20;
    findings.push({
      severity: 'info',
      text: 'A Contact page is reachable.',
    });
  } else {
    findings.push({
      severity: 'warning',
      text: 'No /contact or /contact-us page found. Contact-ability is a baseline E-E-A-T signal.',
    });
    recommendations.push(
      'Publish a Contact page at /contact with a real email address and physical address if applicable.',
    );
  }

  // 3. Last-Modified / freshness — 20 pts
  if (homepage) {
    const lastMod =
      homepage.headers.get('last-modified') ||
      homepage.headers.get('Last-Modified');
    if (lastMod) {
      score += 20;
      findings.push({
        severity: 'info',
        text: `Homepage advertises a Last-Modified header (${lastMod}) — a freshness signal AI crawlers respect.`,
      });
    } else {
      score += 5;
      findings.push({
        severity: 'warning',
        text: 'No Last-Modified header on the homepage. AI crawlers cannot tell when your content last changed.',
      });
      recommendations.push(
        'Configure your CDN or app server to emit a Last-Modified header on HTML responses.',
      );
    }
  }

  // 4. Author / Person markup in JSON-LD — 30 pts
  if (homepage && homepage.ok && hasAuthorInJsonLd(homepage.text)) {
    score += 30;
    findings.push({
      severity: 'info',
      text: 'Author or Person markup is present in JSON-LD — strong E-E-A-T signal.',
    });
  } else {
    findings.push({
      severity: 'warning',
      text: 'No structured author/Person data found. AI assistants cannot attribute your content to a real human expert.',
    });
    recommendations.push(
      'Add Person JSON-LD with name, jobTitle, sameAs (LinkedIn, Twitter), and worksFor for every author on your site.',
    );
  }

  const clamped = Math.min(100, Math.max(0, score));
  return {
    score: clamped,
    grade: scoreToGrade(clamped),
    findings,
    recommendations,
  };
}
