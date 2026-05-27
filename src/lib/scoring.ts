import type { RawFindings } from '@/src/types/audit';

export function getGrade(score: number): string {
  if (score < 0 || score > 100) {
    throw new Error('Score out of bounds: must be 0–100');
  }
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
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

export function scoreAiCrawler(findings: RawFindings | null | undefined): number {
  if (!findings) return 0;
  let score = 0;
  if (findings.robotsTxtAllowsAI) score += 40;
  if (findings.sitemapListed) score += 30;
  if (findings.canonicalUrl !== null) score += 20;
  if (findings.openGraphPresent) score += 10;
  return clamp(score);
}

export function scoreSchema(findings: RawFindings | null | undefined): number {
  if (!findings) return 0;
  const uniqueTypes = Array.from(new Set(findings.structuredDataTypes));
  if (uniqueTypes.length > 0) {
    const score = 50 + (uniqueTypes.length - 1) * 10;
    return clamp(score);
  }
  if (findings.schemaMarkup.length > 0) return clamp(20);
  return 0;
}

export function scoreContentStructure(findings: RawFindings | null | undefined): number {
  if (!findings) return 0;
  let score = 0;
  if (findings.wordCount >= 300) score += 30;
  if (findings.wordCount >= 600) score += 20;
  if (findings.internalLinks.length >= 3) score += 25;
  if (findings.externalLinks.length >= 1) score += 25;
  return clamp(score);
}

export function scoreAuthority(findings: RawFindings | null | undefined): number {
  if (!findings) return 0;
  let score = 0;
  if (findings.externalLinks.length >= 5) score += 40;
  else if (findings.externalLinks.length >= 1) score += 20;
  if (findings.openGraphPresent) score += 30;
  if (findings.canonicalUrl !== null) score += 30;
  return clamp(score);
}

export function scoreFreshness(findings: RawFindings | null | undefined): number {
  if (!findings) return 0;
  if (findings.lastModified === null) return 0;
  const lastModMs = new Date(findings.lastModified).getTime();
  if (Number.isNaN(lastModMs)) return 0;
  const ageDays = (Date.now() - lastModMs) / (1000 * 60 * 60 * 24);
  if (ageDays <= 30) return clamp(100);
  if (ageDays <= 90) return clamp(70);
  if (ageDays <= 180) return clamp(50);
  if (ageDays <= 365) return clamp(30);
  return clamp(10);
}
