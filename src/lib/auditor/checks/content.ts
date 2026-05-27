import * as cheerio from 'cheerio';
import { fetchResource } from '@/lib/auditor/fetch';
import { scoreToGrade, type CheckResult, type Finding } from '@/lib/types';

export async function runContentCheck(
  origin: string,
): Promise<Omit<CheckResult, 'id' | 'label' | 'status'>> {
  const res = await fetchResource(origin);

  const findings: Finding[] = [];
  const recommendations: string[] = [];

  if (!res || !res.ok) {
    findings.push({
      severity: 'critical',
      text: `Could not fetch the homepage (status ${res?.status ?? 'unreachable'}).`,
    });
    return { score: 0, grade: scoreToGrade(0), findings, recommendations };
  }

  const $ = cheerio.load(res.text);
  let score = 0;

  // 1. H1 (unique, present)  — 20 pts
  const h1s = $('h1');
  if (h1s.length === 1) {
    score += 20;
    findings.push({ severity: 'info', text: 'A single, unique H1 is present.' });
  } else if (h1s.length === 0) {
    findings.push({
      severity: 'critical',
      text: 'No H1 tag found. AI assistants rely on H1 to identify the page topic.',
    });
    recommendations.push(
      'Add exactly one descriptive H1 to the homepage that names the brand and its core offering.',
    );
  } else {
    score += 8;
    findings.push({
      severity: 'warning',
      text: `${h1s.length} H1 tags found — multiple H1s dilute the topical signal.`,
    });
    recommendations.push('Use only one H1 per page; demote the others to H2.');
  }

  // 2. Heading hierarchy — no skipped levels — 15 pts
  const levels: number[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tag = (el as { tagName?: string }).tagName ?? '';
    const n = Number(tag.replace('h', ''));
    if (!Number.isNaN(n)) levels.push(n);
  });

  let skipped = false;
  for (let i = 1; i < levels.length; i += 1) {
    if (levels[i] - levels[i - 1] > 1) {
      skipped = true;
      break;
    }
  }
  if (levels.length === 0) {
    findings.push({
      severity: 'warning',
      text: 'No heading tags were found at all.',
    });
    recommendations.push('Structure the page with H1 → H2 → H3 headings.');
  } else if (!skipped) {
    score += 15;
    findings.push({ severity: 'info', text: 'Heading hierarchy is well-ordered.' });
  } else {
    score += 5;
    findings.push({
      severity: 'warning',
      text: 'Heading hierarchy skips levels (e.g. H1 → H3). This confuses AI document parsers.',
    });
    recommendations.push('Fix heading hierarchy so levels never skip (no H1 → H3 jumps).');
  }

  // 3. FAQ-like content — 25 pts
  const questionHeadings = $('h2, h3').filter((_, el) => {
    const text = $(el).text().trim();
    return text.endsWith('?');
  });
  const dlBlocks = $('dl').filter((_, el) => $(el).find('dt').length > 0);

  if (questionHeadings.length >= 3 || dlBlocks.length > 0) {
    score += 25;
    findings.push({
      severity: 'info',
      text: `FAQ-style content detected (${questionHeadings.length} question headings, ${dlBlocks.length} dl block(s)). This is rocket fuel for AI answer surfaces.`,
    });
  } else if (questionHeadings.length > 0) {
    score += 10;
    findings.push({
      severity: 'warning',
      text: `Only ${questionHeadings.length} question heading(s) found — AI assistants reward dense FAQ sections.`,
    });
    recommendations.push(
      'Add a dedicated FAQ section answering 5+ real customer questions, marked up with FAQPage schema.',
    );
  } else {
    findings.push({
      severity: 'critical',
      text: 'No FAQ-style content detected. FAQs are the highest-leverage content format for AI search.',
    });
    recommendations.push(
      'Add a FAQ section to the homepage and primary landing pages — use real question phrasing customers actually type into ChatGPT and Perplexity.',
    );
  }

  // 4. Meta description — 20 pts
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() ?? '';
  if (!metaDesc) {
    findings.push({
      severity: 'critical',
      text: 'Missing meta description — AI snippets and SERP previews fall back to scraped text.',
    });
    recommendations.push(
      'Add a 120–160 character meta description that names your brand and the customer problem you solve.',
    );
  } else if (metaDesc.length >= 120 && metaDesc.length <= 160) {
    score += 20;
    findings.push({
      severity: 'info',
      text: `Meta description is ${metaDesc.length} characters — within the optimal 120–160 range.`,
    });
  } else {
    score += 8;
    findings.push({
      severity: 'warning',
      text: `Meta description is ${metaDesc.length} characters — optimal is 120–160.`,
    });
    recommendations.push(
      `Adjust meta description length to 120–160 characters (currently ${metaDesc.length}).`,
    );
  }

  // 5. Open Graph tags — 20 pts (og:title 6, og:description 6, og:image 8)
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');

  let ogScore = 0;
  if (ogTitle) ogScore += 6;
  if (ogDesc) ogScore += 6;
  if (ogImage) ogScore += 8;
  score += ogScore;

  const missingOg: string[] = [];
  if (!ogTitle) missingOg.push('og:title');
  if (!ogDesc) missingOg.push('og:description');
  if (!ogImage) missingOg.push('og:image');

  if (missingOg.length === 0) {
    findings.push({ severity: 'info', text: 'All Open Graph tags are present.' });
  } else {
    findings.push({
      severity: 'warning',
      text: `Missing Open Graph tag(s): ${missingOg.join(', ')} — affects how AI assistants render link previews.`,
    });
    recommendations.push(
      `Add ${missingOg.join(', ')} meta tag(s) to the homepage <head>.`,
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
