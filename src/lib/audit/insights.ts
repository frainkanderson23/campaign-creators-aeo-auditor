import type { RawFindings } from '@/src/types/audit';

export function generatePreviewInsights(findings: RawFindings): string[] {
  const aiCrawlerInsight = !findings.hasLlmsTxt
    ? 'Add a /llms.txt file to explicitly signal AI crawlers that your content is available for indexing.'
    : !findings.robotsTxtAllowsAI
      ? 'Update your robots.txt to allow AI crawlers such as GPTBot and ClaudeBot.'
      : 'Your site is well-configured for AI crawler access — maintain your robots.txt and llms.txt.';

  const schemaInsight =
    findings.structuredDataCount === 0
      ? 'Implement structured data (e.g. FAQPage or Article schema) to help AI engines understand your content.'
      : findings.faqCount === 0
        ? 'Add FAQ sections with FAQPage schema markup to increase the chance of AI-cited answers.'
        : 'Your structured data coverage is solid — consider expanding schema types for broader AI visibility.';

  const authorityInsight = !findings.authorInfo
    ? 'Add clear author attribution and credentials to build E-E-A-T signals for AI engines.'
    : !findings.lastModified && !findings.publicationDate
      ? 'Include visible publication and last-modified dates to signal content freshness to AI systems.'
      : 'Strong authority signals detected — keep content updated regularly to maintain freshness scores.';

  return [aiCrawlerInsight, schemaInsight, authorityInsight];
}
