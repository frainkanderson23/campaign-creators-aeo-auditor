'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { AuditHeroScore } from './AuditHeroScore';
import { AuditScoreCard } from './AuditScoreCard';
import { EmailGateOverlay } from './EmailGateOverlay';
import { ConsultationCTA } from './ConsultationCTA';
import styles from './AuditResultPage.module.css';

const CATEGORIES = [
  'Structured Data',
  'Content Clarity',
  'Authority Signals',
  'Citation Readiness',
  'Technical SEO',
] as const;

const UNLOCKED_SCORES = [78, 55, 62, 45, 70];

const UNLOCKED_INSIGHTS: Record<string, string> = {
  'Structured Data': 'Missing Organization and FAQ schema on key pages.',
  'Content Clarity': 'Content is readable but lacks definitional cornerstones.',
  'Authority Signals': 'Brand mentions below category average.',
  'Citation Readiness': 'Insufficient data citations and external references.',
  'Technical SEO': 'Crawlability is solid; freshness signals are absent.',
};

export interface AuditResultPageProps {
  auditId: string;
  state: 'loading' | 'failed' | 'preview' | 'unlocked';
  score: number;
  grade: string;
  domain: string;
}

export function AuditResultPage({
  auditId: _auditId,
  state: initialState,
  score,
  grade,
  domain,
}: AuditResultPageProps) {
  const [displayState, setDisplayState] = useState(initialState);
  const router = useRouter();

  if (displayState === 'loading') {
    return (
      <EmptyState
        icon={
          <Loader2
            width={28}
            height={28}
            className={styles.spin}
            style={{ color: 'var(--primary)' }}
            aria-hidden
          />
        }
        heading="Analysing your AEO signals…"
      />
    );
  }

  if (displayState === 'failed') {
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
        heading="Audit failed. Please try again."
        action={
          <button
            className={styles.tryAgain}
            onClick={() => router.push('/')}
          >
            Try Again
          </button>
        }
      />
    );
  }

  const isLocked = displayState === 'preview';

  return (
    <div className={styles.page}>
      <AuditHeroScore
        score={score}
        grade={grade}
        domain={domain}
        locked={isLocked}
      />
      <div className={styles.cardGrid}>
        {CATEGORIES.map((category, i) => (
          <AuditScoreCard
            key={category}
            category={category}
            score={isLocked ? 0 : UNLOCKED_SCORES[i]}
            insight={isLocked ? '' : (UNLOCKED_INSIGHTS[category] ?? '')}
            locked={isLocked}
          />
        ))}
      </div>
      {isLocked ? (
        <EmailGateOverlay onUnlock={() => setDisplayState('unlocked')} />
      ) : (
        <ConsultationCTA />
      )}
    </div>
  );
}

export default AuditResultPage;
