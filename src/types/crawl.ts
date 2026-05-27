export interface CrawledPageImage {
  src: string;
  alt: string;
}

export interface CrawledPage {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  canonicalUrl: string;
  structuredData: object[];
  wordCount: number;
  internalLinks: string[];
  externalLinks: string[];
  images: CrawledPageImage[];
  statusCode: number;
  fetchError: string | null;
}

export interface RobotsBotEntry {
  allowed: boolean;
}

export type RobotsData = Record<string, RobotsBotEntry>;

export interface ScorerInput {
  crawledPages: CrawledPage[];
  robotsData: RobotsData;
  sitemapUrls: string[];
  domainUrl: string;
}

export interface ScoringResult {
  scores: Record<string, number>;
  recommendations: string[];
  overallScore: number;
}
