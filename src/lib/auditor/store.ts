import type { AuditResult } from '@/lib/types';

const globalAny = globalThis as typeof globalThis & {
  __aeoAuditStore?: Map<string, AuditResult>;
};

export const auditStore: Map<string, AuditResult> =
  globalAny.__aeoAuditStore ?? (globalAny.__aeoAuditStore = new Map());
