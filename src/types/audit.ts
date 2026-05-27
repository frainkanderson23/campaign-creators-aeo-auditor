export interface Signal {
  id: string;
  label: string;
  present: boolean;
  score: number;
  maxScore: number;
  notes?: string;
}

export interface RawFindings {
  url: string;
  statusCode: number;
  robotsTxtAllowsAI: boolean;
  hasLlmsTxt: boolean;
  schemaTypes: string[];
  headingStructure: {
    h1: number;
    h2: number;
    h3: number;
  };
  wordCount: number;
  lastModified?: string;
  internalLinks: number;
  externalLinks: number;
  metaDescription?: string;
  title?: string;
  canonicalUrl?: string;
  openGraphTags: Record<string, string>;
  structuredDataCount: number;
  faqCount: number;
  authorInfo: boolean;
  publicationDate?: string;
}

export interface CrawledPage {
  url: string;
  findings: RawFindings;
  crawledAt: string;
}

export interface AuditRequest {
  url: string;
  email?: string;
  requestedAt: string;
}

export interface AuditResult {
  id: string;
  url: string;
  scores: {
    ai_crawler: number;
    schema: number;
    content_structure: number;
    authority: number;
    freshness: number;
    overall: number;
  };
  grade: string;
  findings: RawFindings;
  insights: string[];
  createdAt: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

export interface Lead {
  id: string;
  email: string;
  auditId: string;
  createdAt: string;
  gdprConsent: boolean;
}
