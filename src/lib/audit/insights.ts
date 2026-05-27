export interface CategoryFinding {
  [key: string]: unknown;
}

export interface Category {
  score: number;
  findings: CategoryFinding[];
}

export type Categories = Record<string, Category>;

function categoryScore(categories: Categories, key: string): number | null {
  const c = categories[key];
  if (!c || typeof c.score !== 'number') return null;
  return c.score;
}

export function generatePreviewInsights(categories: Categories): string[] {
  const insights: string[] = [];

  const aiCrawler = categoryScore(categories, 'ai_crawler');
  if (aiCrawler !== null) {
    if (aiCrawler < 50) {
      insights.push(
        'Your site blocks major AI crawlers — you are invisible to ChatGPT, Claude, and Perplexity.',
      );
    } else if (aiCrawler < 80) {
      insights.push(
        'AI crawlers can access your site, but sitemap gaps reduce indexing efficiency.',
      );
    } else {
      insights.push(
        'AI crawlers have full access to your site with a well-structured sitemap.',
      );
    }
  }

  const schema = categoryScore(categories, 'schema');
  if (schema !== null) {
    if (schema < 40) {
      insights.push(
        'No structured data detected. AI engines cannot extract reliable facts from your pages.',
      );
    } else if (schema < 70) {
      insights.push(
        'Basic schema markup found. Adding FAQ or HowTo schema would significantly boost AI answer inclusion.',
      );
    } else {
      insights.push(
        'Strong schema implementation. Your content is well-structured for AI extraction.',
      );
    }
  }

  const contentStructure = categoryScore(categories, 'content_structure');
  if (contentStructure !== null) {
    if (contentStructure < 50) {
      insights.push(
        'Content structure is poor. Missing headings and meta descriptions reduce AI comprehension.',
      );
    } else if (contentStructure < 75) {
      insights.push(
        'Content structure is adequate but could be improved with more descriptive headings and richer content.',
      );
    } else {
      insights.push(
        'Content structure is strong. Well-organized pages improve AI answer engine relevance.',
      );
    }
  }

  const authority = categoryScore(categories, 'authority');
  if (authority !== null && authority < 60) {
    insights.push(
      'Authority signals are weak. Building backlinks and brand mentions would improve AI citation likelihood.',
    );
  }

  const freshness = categoryScore(categories, 'freshness');
  if (freshness !== null && freshness < 60) {
    insights.push(
      'Content freshness is low. Regular updates help AI engines prioritize your pages.',
    );
  }

  return insights;
}
