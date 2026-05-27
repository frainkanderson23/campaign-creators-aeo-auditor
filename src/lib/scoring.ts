import type { RawFindings } from '@/src/types/audit';

export function getGrade(score: number): string {
  if (score < 0 || score > 100) {
    throw new RangeError('Score out of bounds: must be between 0 and 100');
  }
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

export function computeOverallScore(scores: {
  ai_crawler: number;
  schema: number;
  content_structure: number;
  authority: number;
  freshness: number;
}): number {
  const result =
    scores.ai_crawler * 0.25 +
    scores.schema * 0.25 +
    scores.content_structure * 0.2 +
    scores.authority * 0.15 +
    scores.freshness * 0.15;
  return Math.round(result * 100) / 100;
}

function clamp(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export function scoreAiCrawler(findings: RawFindings): number {
  if (!findings) return 0;
  let score = 0;
  if (findings.robotsTxtAllowsAI === true) score += 40;
  if (findings.hasLlmsTxt === true) score += 35;
  if (findings.statusCode === 200) score += 25;
  return clamp(score);
}

export function scoreSchema(findings: RawFindings): number {
  if (!findings) return 0;
  let score = 0;
  const count = findings.structuredDataCount ?? 0;
  if (count >= 1) score += 30;
  if (count >= 3) score += 20;
  const types = Array.isArray(findings.schemaTypes) ? findings.schemaTypes : [];
  if (types.includes('FAQPage')) score += 25;
  if (types.includes('Article') || types.includes('NewsArticle')) score += 15;
  const ogKeys = findings.openGraphTags
    ? Object.keys(findings.openGraphTags)
    : [];
  if (ogKeys.length >= 2) score += 10;
  return clamp(score);
}

export function scoreContentStructure(findings: RawFindings): number {
  if (!findings) return 0;
  let score = 0;
  const headings = findings.headingStructure ?? { h1: 0, h2: 0, h3: 0 };
  if (headings.h1 === 1) score += 20;
  if (headings.h2 >= 2) score += 15;
  const wordCount = findings.wordCount ?? 0;
  if (wordCount >= 300) score += 15;
  if (wordCount >= 800) score += 15;
  if (typeof findings.metaDescription === 'string' && findings.metaDescription.length > 0) {
    score += 10;
  }
  if ((findings.faqCount ?? 0) >= 1) score += 15;
  if (typeof findings.title === 'string' && findings.title.length > 0) {
    score += 10;
  }
  return clamp(score);
}

export function scoreAuthority(findings: RawFindings): number {
  if (!findings) return 0;
  let score = 0;
  if (findings.authorInfo === true) score += 40;
  if ((findings.externalLinks ?? 0) >= 2) score += 30;
  if (typeof findings.canonicalUrl === 'string' && findings.canonicalUrl.length > 0) {
    score += 20;
  }
  if ((findings.internalLinks ?? 0) >= 3) score += 10;
  return clamp(score);
}

export function scoreFreshness(findings: RawFindings): number {
  if (!findings) return 0;
  const dateStr = findings.lastModified ?? findings.publicationDate;
  if (!dateStr) return 0;
  const ms = new Date(dateStr).getTime();
  if (Number.isNaN(ms)) return 0;
  const ageDays = (Date.now() - ms) / (1000 * 60 * 60 * 24);
  if (ageDays <= 90) return clamp(60);
  if (ageDays <= 365) return clamp(30);
  return clamp(10);
}
