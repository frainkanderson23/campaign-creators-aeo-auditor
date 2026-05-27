import type { CategoryScores, Signal } from '@/src/types/audit';

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
