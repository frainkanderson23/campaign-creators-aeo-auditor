export interface Signal {
  label: string;
  value: string | number | boolean;
  pass: boolean;
}

export interface RawFindings {
  url: string;
  htmlSnapshot: string;
  schemaMarkup: string[];
  internalLinks: string[];
  externalLinks: string[];
  wordCount: number;
  lastModified: string | null;
  robotsTxtAllowsAI: boolean;
  sitemapListed: boolean;
  canonicalUrl: string | null;
  openGraphPresent: boolean;
  structuredDataTypes: string[];
}

export interface CrawledPage {
  url: string;
  findings: RawFindings;
  crawledAt: string;
}

export interface AuditRequest {
  url: string;
  email?: string;
}

export interface Lead {
  email: string;
  url: string;
  capturedAt: string;
}

export interface AuditScores {
  ai_crawler: number;
  schema: number;
  content_structure: number;
  authority: number;
  freshness: number;
  overall: number;
}

export interface AuditGrades {
  ai_crawler: string;
  schema: string;
  content_structure: string;
  authority: string;
  freshness: string;
  overall: string;
}

export interface AuditResult {
  id: string;
  url: string;
  requestedAt: string;
  crawledPage: CrawledPage;
  scores: AuditScores;
  grades: AuditGrades;
  insights: string[];
  lead?: Lead;
}
