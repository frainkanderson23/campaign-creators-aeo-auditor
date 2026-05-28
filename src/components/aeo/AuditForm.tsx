'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import styles from './AuditForm.module.css';

const TRUST_SIGNALS = [
  'No credit card required',
  'Results in 30 seconds',
  '10,000+ businesses analyzed',
] as const;

const RATE_LIMIT_MESSAGE =
  'Too many requests. Please wait a moment and try again.';
const SERVER_ERROR_MESSAGE =
  'Something went wrong on our end. Please try again shortly.';
const NETWORK_ERROR_MESSAGE =
  'Connection error. Please check your network and try again.';

type TrimResult = { trimmed: string; wasTrimmed: boolean };

function trimToRoot(input: string): TrimResult | null {
  const candidate = input.trim();
  const withProtocol = /^https?:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (!parsed.hostname) return null;
    const trimmed = `${parsed.protocol}//${parsed.hostname}`;
    const hadPath = parsed.pathname !== '' && parsed.pathname !== '/';
    const hadQuery = parsed.search.length > 0;
    const hadHash = parsed.hash.length > 0;
    return { trimmed, wasTrimmed: hadPath || hadQuery || hadHash };
  } catch {
    return null;
  }
}

export function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const raw = url.trim();
    if (!raw) {
      setError('Please enter a URL to analyze');
      setNotice(null);
      return;
    }

    const result = trimToRoot(raw);
    if (!result) {
      setError('Please enter a valid URL');
      setNotice(null);
      return;
    }

    const { trimmed, wasTrimmed } = result;

    setNotice(
      wasTrimmed
        ? `We've trimmed your URL to the root domain: ${trimmed}`
        : null,
    );
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      if (response.status === 201) {
        const data = (await response.json()) as { auditId?: string };
        if (data?.auditId) {
          router.push(`/audit/${data.auditId}`);
          return;
        }
        setError(SERVER_ERROR_MESSAGE);
        return;
      }

      if (response.status === 429) {
        setError(RATE_LIMIT_MESSAGE);
        return;
      }

      setError(SERVER_ERROR_MESSAGE);
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor="audit-url" className={styles.srOnly}>
        Website URL
      </label>
      <Input
        id="audit-url"
        type="url"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="off"
        placeholder="https://yourbusiness.com"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          if (error) setError(null);
          if (notice) setNotice(null);
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'audit-url-error' : undefined}
        disabled={submitting}
        className={styles.input}
      />

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" block disabled={submitting}>
        {submitting ? 'Analyzing…' : 'Analyze My AEO Score'}
      </Button>

      {error && (
        <p id="audit-url-error" role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <ul className={styles.trustRow} aria-label="Trust signals">
        {TRUST_SIGNALS.map((signal) => (
          <li key={signal} className={styles.trustItem}>
            {signal}
          </li>
        ))}
      </ul>
    </form>
  );
}

export default AuditForm;
