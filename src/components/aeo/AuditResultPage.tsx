'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui';
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

export interface AuditResultPageProps {
  state: AuditState;
  score: number;
  grade: string;
  domain: string;
  categoryScores: CategoryScore[];
}

const POLL_TIMEOUT_MS = 60_000;

export function AuditResultPage({
  state: initialState,
  score,
  grade,
  domain,
  categoryScores,
}: AuditResultPageProps) {
  const [state, setState] = useState<AuditState>(initialState);

  useEffect(() => {
    if (state !== 'loading') return;
    const timer = window.setTimeout(() => {
      setState('timeout');
    }, POLL_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

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
            style={{ color: 'var(--color-primary)' }}
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
            style={{ color: 'var(--grade-f)' }}
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

  if (state === 'preview') {
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
        <EmailGateOverlay onUnlock={() => setState('unlocked')} />
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
        {categoryScores.map((cat) => (
          <AuditScoreCard
            key={cat.label}
            label={cat.label}
            score={cat.score}
            grade={cat.grade}
            locked={false}
          />
        ))}
      </div>
      <ConsultationCTA
        heading="Want expert help?"
        body="Book a free 30-minute AEO strategy call with our team."
        ctaLabel="Book a Free Call"
        ctaHref="#"
      />
    </div>
  );
}

export default AuditResultPage;
