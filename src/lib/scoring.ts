import type { CategoryScores, Signal } from '@/src/types/audit';
import type { ScorerInput, ScoringResult } from '@/types/crawl';

export function getGrade(score: number): string {
  if (score < 0 || score > 100) {
    throw new Error('Score out of bounds: must be between 0 and 100');
  }
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function computeOverallScore(scores: CategoryScores): number {
  const result =
    scores.ai_crawler * 0.25 +
    scores.schema * 0.25 +
    scores.content_structure * 0.2 +
    scores.authority * 0.15 +
    scores.freshness * 0.15;
  return Math.round(result * 100) / 100;
}

function findSignal(signals: Signal[], type: string): Signal | undefined {
  return signals.find((s) => s.type === type);
}

function isTrue(signal: Signal | undefined): boolean {
  return signal?.value === true;
}

function numericValue(signal: Signal | undefined): number {
  if (!signal) return 0;
  return typeof signal.value === 'number' ? signal.value : 0;
}

function cap(score: number): number {
  return Math.min(score, 100);
}

export function scoreAiCrawler(signals: Signal[]): number {
  if (!signals || signals.length === 0) return 0;
  let score = 0;
  if (isTrue(findSignal(signals, 'robots_txt_allows_gptbot'))) score += 20;
  if (isTrue(findSignal(signals, 'robots_txt_allows_claudebot'))) score += 20;
  if (isTrue(findSignal(signals, 'robots_txt_allows_common_crawl'))) score += 15;
  if (isTrue(findSignal(signals, 'sitemap_exists'))) score += 25;
  if (isTrue(findSignal(signals, 'sitemap_valid_xml'))) score += 20;
  return cap(score);
}

export function scoreSchema(signals: Signal[]): number {
  if (!signals || signals.length === 0) return 0;
  let score = 0;
  if (isTrue(findSignal(signals, 'has_schema_markup'))) score += 30;
  const typesCount = numericValue(findSignal(signals, 'schema_types_count'));
  score += Math.min(typesCount * 5, 30);
  if (isTrue(findSignal(signals, 'has_faq_schema'))) score += 20;
  if (isTrue(findSignal(signals, 'has_how_to_schema'))) score += 10;
  if (isTrue(findSignal(signals, 'has_article_schema'))) score += 10;
  return cap(score);
}

export function scoreContentStructure(signals: Signal[]): number {
  if (!signals || signals.length === 0) return 0;
  let score = 0;
  if (isTrue(findSignal(signals, 'has_h1'))) score += 20;
  const h2Count = numericValue(findSignal(signals, 'h2_count'));
  score += Math.min(h2Count * 5, 20);
  const wordCount = numericValue(findSignal(signals, 'word_count'));
  if (wordCount >= 300) score += 20;
  else if (wordCount >= 150) score += 10;
  if (isTrue(findSignal(signals, 'has_meta_description'))) score += 15;
  if (isTrue(findSignal(signals, 'has_title_tag'))) score += 15;
  if (isTrue(findSignal(signals, 'has_canonical'))) score += 10;
  return cap(score);
}

export function scoreAuthority(signals: Signal[]): number {
  if (!signals || signals.length === 0) return 0;
  let score = 0;
  const externalLinks = numericValue(findSignal(signals, 'external_links_count'));
  score += Math.min(externalLinks * 5, 30);
  if (isTrue(findSignal(signals, 'has_about_page'))) score += 20;
  if (isTrue(findSignal(signals, 'has_contact_page'))) score += 20;
  if (isTrue(findSignal(signals, 'has_author_info'))) score += 20;
  const domainAge = numericValue(findSignal(signals, 'domain_age_years'));
  if (domainAge >= 2) score += 10;
  return cap(score);
}

export function scoreFreshness(signals: Signal[]): number {
  if (!signals || signals.length === 0) return 0;
  let score = 0;
  if (isTrue(findSignal(signals, 'has_last_modified'))) score += 30;
  const daysSinceModified = findSignal(signals, 'days_since_modified');
  if (daysSinceModified && typeof daysSinceModified.value === 'number') {
    const days = daysSinceModified.value;
    if (days <= 30) score += 40;
    else if (days <= 90) score += 20;
    else if (days <= 365) score += 10;
  }
  if (isTrue(findSignal(signals, 'has_publish_date_schema'))) score += 30;
  return cap(score);
}

const BOT_NAMES = ['GPTBot', 'ClaudeBot', 'Googlebot', 'Bingbot'] as const;

export function robotsScore(input: ScorerInput): number {
  const { robotsData } = input;
  let allowedCount = 0;
  for (const bot of BOT_NAMES) {
    if (robotsData?.[bot]?.allowed) allowedCount += 1;
  }
  return cap(Math.round((allowedCount / BOT_NAMES.length) * 100));
}

export function sitemapScore(input: ScorerInput): number {
  const count = input.sitemapUrls?.length ?? 0;
  if (count === 0) return 0;
  if (count >= 10) return 100;
  if (count >= 5) return 80;
  if (count >= 2) return 60;
  return 40;
}

export function structuredDataScore(input: ScorerInput): number {
  const pages = input.crawledPages ?? [];
  if (pages.length === 0) return 0;
  const pagesWithSchema = pages.filter(
    (p) => Array.isArray(p.structuredData) && p.structuredData.length > 0,
  ).length;
  return cap(Math.round((pagesWithSchema / pages.length) * 100));
}

export function titleMetaScore(input: ScorerInput): number {
  const pages = input.crawledPages ?? [];
  if (pages.length === 0) return 0;
  let total = 0;
  for (const page of pages) {
    let pageScore = 0;
    if (page.title && page.title.trim().length > 0) pageScore += 50;
    if (page.metaDescription && page.metaDescription.trim().length > 0) {
      pageScore += 50;
    }
    total += pageScore;
  }
  return cap(Math.round(total / pages.length));
}

export function aeoScore(input: ScorerInput): number {
  const pages = input.crawledPages ?? [];
  if (pages.length === 0) return 0;
  let total = 0;
  for (const page of pages) {
    let pageScore = 0;
    if (page.h1 && page.h1.length > 0) pageScore += 25;
    if (page.h2 && page.h2.length >= 2) pageScore += 25;
    if (typeof page.wordCount === 'number' && page.wordCount >= 300) {
      pageScore += 25;
    } else if (typeof page.wordCount === 'number' && page.wordCount >= 150) {
      pageScore += 12;
    }
    if (page.canonicalUrl && page.canonicalUrl.trim().length > 0) {
      pageScore += 25;
    }
    total += pageScore;
  }
  return cap(Math.round(total / pages.length));
}

function buildRecommendations(
  input: ScorerInput,
  scores: Record<string, number>,
): string[] {
  const recs: string[] = [];

  for (const bot of BOT_NAMES) {
    if (!input.robotsData?.[bot]?.allowed) {
      recs.push(`Allow ${bot} in robots.txt so AI crawlers can index your site.`);
    }
  }

  if ((input.sitemapUrls?.length ?? 0) === 0) {
    recs.push('Publish a sitemap.xml so crawlers can discover your pages.');
  } else if (input.sitemapUrls.length < 5) {
    recs.push('Expand your sitemap.xml to include more pages.');
  }

  if (scores.structuredData < 50) {
    recs.push(
      'Add JSON-LD structured data (Article, FAQPage, Organization) to more pages.',
    );
  }

  if (scores.titleMeta < 80) {
    recs.push('Ensure every page has a unique <title> and meta description.');
  }

  if (scores.aeo < 70) {
    recs.push(
      'Improve on-page structure: one H1 per page, multiple H2s, ≥300 words, and a canonical URL.',
    );
  }

  return recs;
}

export function runAllScorers(input: ScorerInput): ScoringResult {
  const scores: Record<string, number> = {
    robots: robotsScore(input),
    sitemap: sitemapScore(input),
    structuredData: structuredDataScore(input),
    titleMeta: titleMetaScore(input),
    aeo: aeoScore(input),
  };

  const weights = {
    robots: 0.2,
    sitemap: 0.15,
    structuredData: 0.25,
    titleMeta: 0.2,
    aeo: 0.2,
  };

  const overallScore = Math.round(
    scores.robots * weights.robots +
      scores.sitemap * weights.sitemap +
      scores.structuredData * weights.structuredData +
      scores.titleMeta * weights.titleMeta +
      scores.aeo * weights.aeo,
  );

  return {
    scores,
    recommendations: buildRecommendations(input, scores),
    overallScore,
  };
}
