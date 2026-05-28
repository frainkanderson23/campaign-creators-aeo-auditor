'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, Clock, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { AuditHeroScore } from './AuditHeroScore';
import { AuditScoreCard } from './AuditScoreCard';
import { EmailGateOverlay } from './EmailGateOverlay';
import { ConsultationCTA } from './ConsultationCTA';
import styles from './AuditResultPage.module.css';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 60_000;
const MAX_POLLS = 20;

const TIMEOUT_MESSAGE =
  'Audit is taking longer than expected. Please try again.';
const FAILED_FALLBACK_MESSAGE = 'Audit failed. Please try again.';

type CategoryEntry = { score: number | null; grade: string | null };

type CompleteStatus = {
  auditId: string;
  status: 'complete';
  domain_url: string;
  categories: {
    answerability: CategoryEntry;
    structure: CategoryEntry;
    trust: CategoryEntry;
    freshness: CategoryEntry;
    brevity: CategoryEntry;
    overall: CategoryEntry;
  };
  preview_insights?: unknown[];
};

type StatusResponse =
  | { auditId: string; status: 'pending'; domain_url: string }
  | { auditId: string; status: 'processing'; domain_url: string }
  | {
      auditId: string;
      status: 'failed';
      domain_url: string;
      error?: string | null;
    }
  | CompleteStatus;

type BreakdownKey = 'answerability' | 'structure' | 'trust' | 'freshness' | 'brevity';

const BREAKDOWN_LABELS: Record<BreakdownKey, string> = {
  answerability: 'Answerability',
  structure: 'Structure',
  trust: 'Trust',
  freshness: 'Freshness',
  brevity: 'Brevity',
};

const BREAKDOWN_ORDER: readonly BreakdownKey[] = [
  'answerability',
  'structure',
  'trust',
  'freshness',
  'brevity',
];

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

function clampScore(value: number | null): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function normalizeGrade(value: string | null): string {
  return value && value.length > 0 ? value : 'F';
}

function domainFromUrl(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return rawUrl;
  }
}

export function AuditResultPage() {
  const params = useParams<{ auditId: string }>();
  const auditId = typeof params?.auditId === 'string' ? params.auditId : '';

  const [data, setData] = useState<StatusResponse | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!auditId) return;

    let cancelled = false;
    pollCountRef.current = 0;
    startTimeRef.current = Date.now();

    const stopPolling = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const fetchStatus = async () => {
      if (cancelled) return;
      pollCountRef.current += 1;

      try {
        const res = await fetch(`/api/audit/${auditId}/status`, {
          cache: 'no-store',
        });
        if (cancelled) return;

        if (res.ok) {
          const body = (await res.json()) as StatusResponse;
          if (cancelled) return;
          setData(body);
          if (body.status === 'complete' || body.status === 'failed') {
            stopPolling();
            return;
          }
        }
      } catch {
        // swallow; we'll keep polling until timeout
      }

      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= POLL_TIMEOUT_MS || pollCountRef.current >= MAX_POLLS) {
        stopPolling();
        if (!cancelled) setTimedOut(true);
      }
    };

    void fetchStatus();
    intervalRef.current = setInterval(() => {
      void fetchStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [auditId]);

  if (timedOut) {
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
        body={TIMEOUT_MESSAGE}
        action={
          <Link href="/" className={styles.tryAgain}>
            Try Again
          </Link>
        }
      />
    );
  }

  if (!data || data.status === 'pending' || data.status === 'processing') {
    return (
      <EmptyState
        icon={<Loader2 className={styles.spin} width={28} height={28} aria-hidden />}
        heading="Analyzing your site…"
        body="This usually takes 20–30 seconds."
      />
    );
  }

  if (data.status === 'failed') {
    const message =
      ('error' in data && data.error) || FAILED_FALLBACK_MESSAGE;
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
        body={message}
        action={
          <Link href="/" className={styles.tryAgain}>
            Try Again
          </Link>
        }
      />
    );
  }

  const { categories, domain_url } = data;
  const overallScore = clampScore(categories.overall.score);
  const overallGrade = normalizeGrade(categories.overall.grade);
  const domain = domainFromUrl(domain_url);

  const breakdown = BREAKDOWN_ORDER.map((key) => ({
    key,
    label: BREAKDOWN_LABELS[key],
    score: clampScore(categories[key].score),
    grade: normalizeGrade(categories[key].grade),
  }));

  if (!unlocked) {
    return (
      <div className={styles.page}>
        <AuditHeroScore
          score={overallScore}
          grade={overallGrade}
          domain={domain}
          locked={false}
        />
        <div className={styles.cardGrid}>
          {breakdown.map((cat) => (
            <AuditScoreCard
              key={cat.key}
              label={cat.label}
              score={cat.score}
              grade={cat.grade}
              locked
            />
          ))}
        </div>
        <EmailGateOverlay onUnlock={() => setUnlocked(true)} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AuditHeroScore
        score={overallScore}
        grade={overallGrade}
        domain={domain}
        locked={false}
      />
      <div className={styles.cardGrid}>
        {breakdown.map((cat) => (
          <AuditScoreCard
            key={cat.key}
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
