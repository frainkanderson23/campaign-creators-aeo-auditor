export type CheckId = 'crawlability' | 'schema' | 'content' | 'authority';

export type CheckStatus = 'pending' | 'running' | 'complete' | 'error';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export type Severity = 'info' | 'warning' | 'critical';

export interface Finding {
  text: string;
  severity: Severity;
}

export interface CheckResult {
  id: CheckId;
  label: string;
  status: CheckStatus;
  score: number;
  grade: Grade;
  findings: Finding[];
  recommendations: string[];
  error?: string;
}

export interface AuditResult {
  id: string;
  domain: string;
  normalizedUrl: string;
  status: 'processing' | 'complete' | 'error';
  createdAt: number;
  completedAt?: number;
  overallScore?: number;
  overallGrade?: Grade;
  checks: Record<CheckId, CheckResult>;
  error?: string;
}

export const CHECK_LABELS: Record<CheckId, string> = {
  crawlability: 'AI Crawlability',
  schema: 'Schema & Structure',
  content: 'Content Readiness',
  authority: 'Authority & Trust',
};

export const CHECK_ORDER: CheckId[] = [
  'crawlability',
  'schema',
  'content',
  'authority',
];

export function scoreToGrade(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export const GRADE_COLORS: Record<Grade, string> = {
  A: '#10B981',
  B: '#22C55E',
  C: '#F59E0B',
  D: '#F97316',
  F: '#EF4444',
};
