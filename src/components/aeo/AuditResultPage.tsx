'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui';
import type { RawFindings } from '@/types/audit';
import { AuditHeroScore } from './AuditHeroScore';
import { AuditScoreCard } from './AuditScoreCard';
import { EmailGateOverlay } from './EmailGateOverlay';
import { ConsultationCTA } from './ConsultationCTA';
import styles from './AuditResultPage.module.css';

export type AuditState =
  | 'loading'
  | 'failed'
  | 'timeout'
  | 'preview'
  | 'unlocked';

export type CategoryScore = {
  label: string;
  score: number;
  grade: string;
  locked: boolean;
};

export interface FullAuditResult {
  raw_findings?: RawFindings | null;
  categories?: Record<string, { score: number; grade: string }>;
  [key: string]: unknown;
}

export interface AuditResultPageProps {
  state: AuditState;
  score: number;
  grade: string;
  domain: string;
  categoryScores: CategoryScore[];
  auditRequestId: string;
}

const POLL_TIMEOUT_MS = 60_000;

export function AuditResultPage({
  state: initialState,
  score,
  grade,
  domain,
  categoryScores,
  auditRequestId,
}: AuditResultPageProps) {
  const [state, setState] = useState<AuditState>(initialState);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    initialState === 'unlocked',
  );
  const [fullResult, setFullResult] = useState<FullAuditResult | null>(null);

  useEffect(() => {
    if (state !== 'loading') return;
    const timer = window.setTimeout(() => {
      setState('timeout');
    }, POLL_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  function handleUnlock(_email: string, result: unknown) {
    const next =
      result && typeof result === 'object'
        ? (result as FullAuditResult)
        : ({} as FullAuditResult);
    setFullResult((prev) => ({ ...(prev ?? {}), ...next }));
    setIsUnlocked(true);
    toast.success('Your results are unlocked');
  }

  if (state === 'loading') {
    return (
      <EmptyState
        icon={<Loader2 className={styles.spin} width={28} height={28} aria-hidden />}
        heading="Analyzing your site…"
        body="This usually takes 20–30 seconds."
      />
    );
  }

  if (state === 'timeout') {
    return (
      <EmptyState
        icon={
          <Clock
            width={28}
            height={28}
            style={{ color: 'var(--primary)' }}
            aria-hidden
          />
        }
        heading="This is taking longer than expected"
        body="Your audit timed out after 60 seconds. Please try again."
        action={
          <Link href="/" className={styles.tryAgain}>
            Try Again
          </Link>
        }
      />
    );
  }

  if (state === 'failed') {
    return (
      <EmptyState
        icon={
          <AlertCircle
            width={28}
            height={28}
            style={{ color: 'var(--bad)' }}
            aria-hidden
          />
        }
        heading="Audit Failed"
        body="Something went wrong running your audit."
        action={
          <Link href="/" className={styles.tryAgain}>
            Try Again
          </Link>
        }
      />
    );
  }

  const unlockedCategories = mergeCategoryScores(categoryScores, fullResult);

  if (!isUnlocked) {
    return (
      <div className={styles.page}>
        <AuditHeroScore
          score={score}
          grade={grade}
          domain={domain}
          locked={false}
        />
        <div className={styles.cardGrid}>
          {categoryScores.map((cat) => (
            <AuditScoreCard
              key={cat.label}
              label={cat.label}
              score={cat.score}
              grade={cat.grade}
              locked
            />
          ))}
        </div>
        <EmailGateOverlay
          auditRequestId={auditRequestId}
          onUnlocked={handleUnlock}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AuditHeroScore
        score={score}
        grade={grade}
        domain={domain}
        locked={false}
      />
      <div className={styles.cardGrid}>
        {unlockedCategories.map((cat) => (
          <AuditScoreCard
            key={cat.label}
            label={cat.label}
            score={cat.score}
            grade={cat.grade}
            locked={false}
          />
        ))}
      </div>
      <ConsultationCTA />
    </div>
  );
}

function mergeCategoryScores(
  base: CategoryScore[],
  result: FullAuditResult | null,
): CategoryScore[] {
  if (!result?.categories) {
    return base.map((c) => ({ ...c, locked: false }));
  }
  const categoryKeys = Object.keys(result.categories);
  return base.map((cat, index) => {
    const key = categoryKeys[index];
    const remote = key ? result.categories?.[key] : undefined;
    return {
      ...cat,
      score: typeof remote?.score === 'number' ? remote.score : cat.score,
      grade: remote?.grade ?? cat.grade,
      locked: false,
    };
  });
}

export default AuditResultPage;
