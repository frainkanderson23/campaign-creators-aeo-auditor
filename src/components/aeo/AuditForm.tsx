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

const NETWORK_ERROR_MESSAGE =
  'No connection detected. Please check your internet connection and try again.';

function trimToRoot(input: string): string | null {
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
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return null;
  }
}

function isNetworkError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }
  if (err instanceof TypeError) return true;
  if (err instanceof Error && /fetch|network/i.test(err.message)) {
    return true;
  }
  return false;
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

    const stripped = trimToRoot(raw);
    if (!stripped) {
      setError('Please enter a valid URL');
      setNotice(null);
      return;
    }

    setNotice(stripped !== raw ? `We've trimmed your URL to the root domain: ${stripped}` : null);
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: stripped }),
      });

      if (!response.ok) {
        let message = 'Something went wrong. Please try again.';
        try {
          const data = (await response.json()) as { error?: string };
          if (data?.error) message = data.error;
        } catch {
          // ignore JSON parse failure; use default message
        }
        setError(message);
        setSubmitting(false);
        return;
      }

      const data = (await response.json()) as { auditId?: string };
      if (!data?.auditId) {
        setError('Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }

      router.push(`/audit/${data.auditId}`);
    } catch (err) {
      if (isNetworkError(err)) {
        setError(NETWORK_ERROR_MESSAGE);
      } else {
        setError('Something went wrong. Please try again.');
      }
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
