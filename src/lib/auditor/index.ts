import { auditStore } from '@/lib/auditor/store';
import { normalizeDomain } from '@/lib/auditor/normalize';
import { runCrawlabilityCheck } from '@/lib/auditor/checks/crawlability';
import { runSchemaCheck } from '@/lib/auditor/checks/schema';
import { runContentCheck } from '@/lib/auditor/checks/content';
import { runAuthorityCheck } from '@/lib/auditor/checks/authority';
import { runAiCitationCheck } from '@/lib/auditor/checks/ai-citation';
import {
  CHECK_LABELS,
  CHECK_ORDER,
  CHECK_WEIGHTS,
  scoreToGrade,
  type AuditResult,
  type CheckId,
  type CheckResult,
} from '@/lib/types';

function emptyCheck(id: CheckId): CheckResult {
  return {
    id,
    label: CHECK_LABELS[id],
    status: 'pending',
    score: 0,
    grade: 'F',
    findings: [],
    recommendations: [],
  };
}

export function createAuditRecord(id: string, rawDomain: string): AuditResult {
  const normalized = normalizeDomain(rawDomain);
  const record: AuditResult = {
    id,
    domain: normalized?.hostname ?? rawDomain.trim(),
    normalizedUrl: normalized?.origin ?? '',
    status: 'processing',
    createdAt: Date.now(),
    checks: {
      ai_citation:  emptyCheck('ai_citation'),
      crawlability: emptyCheck('crawlability'),
      schema:       emptyCheck('schema'),
      content:      emptyCheck('content'),
      authority:    emptyCheck('authority'),
    },
  };

  if (!normalized) {
    record.status = 'error';
    record.error = 'Invalid domain.';
    record.completedAt = Date.now();
  }

  auditStore.set(id, record);
  return record;
}

const RUNNERS: Record<
  CheckId,
  (
    origin: string,
  ) => Promise<Omit<CheckResult, 'id' | 'label' | 'status'>>
> = {
  ai_citation:  runAiCitationCheck,
  crawlability: runCrawlabilityCheck,
  schema:       runSchemaCheck,
  content:      runContentCheck,
  authority:    runAuthorityCheck,
};

function updateCheck(auditId: string, id: CheckId, patch: Partial<CheckResult>): void {
  const record = auditStore.get(auditId);
  if (!record) return;
  record.checks[id] = { ...record.checks[id], ...patch };
  auditStore.set(auditId, record);
}

export async function runAudit(auditId: string): Promise<void> {
  const record = auditStore.get(auditId);
  if (!record || record.status === 'error') return;

  const origin = record.normalizedUrl;
  if (!origin) {
    record.status = 'error';
    record.error = 'Could not resolve origin URL.';
    record.completedAt = Date.now();
    auditStore.set(auditId, record);
    return;
  }

  for (const id of CHECK_ORDER) {
    updateCheck(auditId, id, { status: 'running' });
    try {
      const result = await RUNNERS[id](origin);
      updateCheck(auditId, id, {
        ...result,
        status: 'complete',
      });
    } catch (err) {
      updateCheck(auditId, id, {
        status: 'error',
        score: 0,
        grade: 'F',
        findings: [
          {
            severity: 'critical',
            text: `Check failed: ${err instanceof Error ? err.message : 'unknown error'}`,
          },
        ],
        recommendations: [],
        error: err instanceof Error ? err.message : 'unknown error',
      });
    }
  }

  const finalRecord = auditStore.get(auditId);
  if (!finalRecord) return;

  // AEO-first weighted score: AI Citation 40%, Crawlability 20%,
  // Content 20%, Schema 10%, Authority 10%
  const overall = Math.round(
    CHECK_ORDER.reduce((sum, id) => {
      return sum + (finalRecord.checks[id].score * (CHECK_WEIGHTS[id] ?? 0));
    }, 0)
  );

  finalRecord.overallScore = overall;
  finalRecord.overallGrade = scoreToGrade(overall);
  finalRecord.status = 'complete';
  finalRecord.completedAt = Date.now();
  auditStore.set(auditId, finalRecord);
}
