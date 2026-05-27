'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui';
import styles from './AuditResultPage.module.css';

const AUDIT_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 2_000;

export type AuditStatus = 'processing' | 'complete' | 'error';

export interface AuditResultPageProps {
  auditId: string;
  domain?: string;
  pollEndpoint?: (auditId: string) => string;
  children?: ReactNode;
  onRetry?: () => void;
}

interface FetchedAudit {
  status: AuditStatus;
  error?: string;
}

export function AuditResultPage({
  auditId,
  domain,
  pollEndpoint = (id) => `/api/audit/${id}`,
  children,
  onRetry,
}: AuditResultPageProps) {
  const [status, setStatus] = useState<AuditStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const cancelledRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRetry = useCallback(() => {
    setStatus('processing');
    setErrorMessage(null);
    setTimedOut(false);
    setAttempt((n) => n + 1);
    onRetry?.();
  }, [onRetry]);

  useEffect(() => {
    cancelledRef.current = false;

    function clearTimers() {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
    }

    async function poll() {
      try {
        const res = await fetch(pollEndpoint(auditId), { cache: 'no-store' });
        if (cancelledRef.current) return;

        if (!res.ok) {
          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }

        const data = (await res.json()) as FetchedAudit;
        if (cancelledRef.current) return;

        if (data.status === 'complete') {
          clearTimers();
          setStatus('complete');
          return;
        }

        if (data.status === 'error') {
          clearTimers();
          setStatus('error');
          setErrorMessage(data.error ?? 'Audit failed.');
          return;
        }

        pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelledRef.current) {
          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    }

    timeoutTimerRef.current = setTimeout(() => {
      if (cancelledRef.current) return;
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      setTimedOut(true);
    }, AUDIT_TIMEOUT_MS);

    poll();

    return () => {
      cancelledRef.current = true;
      clearTimers();
    };
  }, [auditId, attempt, pollEndpoint]);

  if (timedOut) {
    return (
      <section className={styles.state} aria-live="polite">
        <h2 className={styles.title}>This is taking longer than expected</h2>
        <p className={styles.subtitle}>
          We haven&apos;t heard back about{' '}
          <strong>{domain ?? 'your audit'}</strong> in over 60 seconds. You can
          retry now.
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={handleRetry}
          aria-label="Try Again"
        >
          Try Again
        </Button>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className={styles.state} aria-live="polite">
        <h2 className={styles.title}>Something went wrong</h2>
        <p className={styles.subtitle}>
          {errorMessage ?? 'We were unable to finish the audit.'}
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={handleRetry}
          aria-label="Try Again"
        >
          Try Again
        </Button>
      </section>
    );
  }

  if (status === 'processing') {
    return (
      <section className={styles.state} aria-live="polite">
        <h2 className={styles.title}>
          Auditing {domain ?? 'your site'}
        </h2>
        <p className={styles.subtitle}>
          Running checks. This usually takes about 30 seconds.
        </p>
      </section>
    );
  }

  return <>{children}</>;
}

export default AuditResultPage;
