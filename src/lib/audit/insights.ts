import type { CategoryScores, Signal } from '@/src/types/audit';

export function generatePreviewInsights(
  categoryScores: CategoryScores,
  signals: Signal[]
): string[] {
  void signals;

  const insights: string[] = [];

  if (categoryScores.ai_crawler < 50) {
    insights.push(
      'Your site blocks major AI crawlers — you are invisible to ChatGPT, Claude, and Perplexity.'
    );
  } else if (categoryScores.ai_crawler < 80) {
    insights.push(
      'AI crawlers can access your site, but sitemap gaps reduce indexing efficiency.'
    );
  } else {
    insights.push(
      'AI crawlers have full access to your site with a well-structured sitemap.'
    );
  }

  if (categoryScores.schema < 40) {
    insights.push(
      'No structured data detected. AI engines cannot extract reliable facts from your pages.'
    );
  } else if (categoryScores.schema < 70) {
    insights.push(
      'Basic schema markup found. Adding FAQ or HowTo schema would significantly boost AI answer inclusion.'
    );
  } else {
    insights.push(
      'Strong schema implementation. Your content is well-structured for AI extraction.'
    );
  }

  if (categoryScores.content_structure < 50) {
    insights.push(
      'Content structure is poor. Missing headings and meta descriptions reduce AI comprehension.'
    );
  } else if (categoryScores.content_structure < 75) {
    insights.push(
      'Content structure is adequate but could be improved with more descriptive headings and richer content.'
    );
  } else {
    insights.push(
      'Content structure is strong. Well-organized pages improve AI answer engine relevance.'
    );
  }

  return insights;
}
