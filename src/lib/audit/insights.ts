import type { RawFindings } from '@/src/types/audit';

const FALLBACK_INSIGHTS: readonly string[] = [
  'Ensure your page title and meta description are descriptive and keyword-rich.',
  'Consider adding FAQ schema to directly answer common questions in AI results.',
  'Regularly update your content to maintain freshness signals for AI crawlers.',
];

export function generatePreviewInsights(findings: RawFindings): string[] {
  const insights: string[] = [];

  if (!findings.robotsTxtAllowsAI) {
    insights.push(
      'Your robots.txt is blocking AI crawlers — update it to allow GPTBot and ClaudeBot.',
    );
  }
  if (!findings.sitemapListed) {
    insights.push(
      'No sitemap entry detected. Submit an XML sitemap to improve AI indexing.',
    );
  }
  if (findings.structuredDataTypes.length === 0) {
    insights.push(
      'No structured data found. Add Schema.org markup to help AI understand your content.',
    );
  }
  if (findings.wordCount < 300) {
    insights.push(
      'Content is too short. Aim for 300+ words to provide sufficient context for AI answers.',
    );
  }
  if (findings.internalLinks.length < 3) {
    insights.push(
      'Low internal link count. Add more internal links to improve content discoverability.',
    );
  }
  if (findings.lastModified === null) {
    insights.push(
      'Last-modified date is missing. Publishing dates signal freshness to AI systems.',
    );
  }
  if (!findings.openGraphPresent) {
    insights.push(
      'No Open Graph tags detected. Add OG tags to improve content previews in AI summaries.',
    );
  }
  if (findings.externalLinks.length < 1) {
    insights.push(
      'No external links found. Citing authoritative sources boosts your authority signals.',
    );
  }
  if (findings.canonicalUrl === null) {
    insights.push(
      'Canonical URL is missing. Set a canonical tag to prevent duplicate content issues.',
    );
  }

  for (const fallback of FALLBACK_INSIGHTS) {
    if (insights.length >= 3) break;
    insights.push(fallback);
  }

  return insights.slice(0, 3);
}
