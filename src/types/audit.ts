export interface RawFindings {
  url: string;
  statusCode: number;
  html: string;
  headers: Record<string, string>;
  schemaMarkup: unknown[];
  internalLinks: string[];
  externalLinks: string[];
  wordCount: number;
  lastModified: string | null;
  title: string | null;
  metaDescription: string | null;
  h1Tags: string[];
  canonicalUrl: string | null;
  robotsMeta: string | null;
}

export interface CrawledPage extends RawFindings {
  crawledAt: string;
  pageScore: number;
}

export interface AuditRequest {
  url: string;
  email: string;
  tier: 'preview' | 'full';
  requestedAt: string;
}

export interface CategoryScores {
  ai_crawler: number;
  schema: number;
  content_structure: number;
  authority: number;
  freshness: number;
}

export interface AuditResult {
  id: string;
  request: AuditRequest;
  pages: CrawledPage[];
  overallScore: number;
  grade: string;
  categoryScores: CategoryScores;
  insights: string[];
  completedAt: string;
}

export interface Lead {
  id: string;
  email: string;
  url: string;
  auditResultId: string;
  capturedAt: string;
}

export interface Signal {
  type: string;
  label: string;
  value: string | number | boolean | null;
  score: number;
  maxScore: number;
  notes: string | null;
}
