'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import styles from './AuditForm.module.css';

export interface AuditFormProps {
  onAuditStarted?: (auditId: string, rootUrl: string) => void;
  apiEndpoint?: string;
}

interface NormalizedUrl {
  rootUrl: string;
  wasTrimmed: boolean;
}

function normalizeToRootDomain(raw: string): NormalizedUrl | null {
  const trimmedInput = raw.trim();
  if (!trimmedInput) return null;

  const withProtocol = /^https?:\/\//i.test(trimmedInput)
    ? trimmedInput
    : `https://${trimmedInput}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }

  const hostname = url.hostname;
  if (!hostname.includes('.')) return null;

  const rootUrl = `${url.protocol}//${hostname}`;

  const hadPath = url.pathname && url.pathname !== '/';
  const hadQuery = url.search.length > 0;
  const hadHash = url.hash.length > 0;
  const rawHadProtocol = /^https?:\/\//i.test(trimmedInput);
  const rawHadWww = /^(https?:\/\/)?www\./i.test(trimmedInput);
  const hostHasWww = hostname.startsWith('www.');

  const wasTrimmed =
    hadPath ||
    hadQuery ||
    hadHash ||
    (!rawHadProtocol && rawHadWww) ||
    (rawHadWww && !hostHasWww);

  return { rootUrl, wasTrimmed };
}

function isNetworkError(error: unknown): boolean {
  if (
    error instanceof TypeError &&
    error.message.toLowerCase().includes('fetch')
  ) {
    return true;
  }
  if (
    typeof navigator !== 'undefined' &&
    'onLine' in navigator &&
    navigator.onLine === false
  ) {
    return true;
  }
  return false;
}

export function AuditForm({
  onAuditStarted,
  apiEndpoint = '/api/audit',
}: AuditFormProps) {
  const [url, setUrl] = useState('');
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setTrimmedUrl(null);

    const normalized = normalizeToRootDomain(url);
    if (!normalized) {
      setError("That doesn't look like a valid URL.");
      return;
    }

    if (normalized.wasTrimmed) {
      setTrimmedUrl(normalized.rootUrl);
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ domain: normalized.rootUrl }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const data = (await res.json()) as { auditId: string };
      setIsSubmitting(false);
      onAuditStarted?.(data.auditId, normalized.rootUrl);
    } catch (err) {
      if (isNetworkError(err)) {
        setError(
          'No connection detected. Please check your internet connection and try again.',
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor="audit-url" className={styles.label}>
        Website URL
      </label>
      <Input
        id="audit-url"
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="off"
        placeholder="yourcompany.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isSubmitting}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? 'audit-url-error' : trimmedUrl ? 'audit-url-trimmed' : undefined
        }
      />

      {trimmedUrl && (
        <p
          id="audit-url-trimmed"
          role="status"
          className={styles.trimmedNotice}
        >
          We&apos;ve trimmed your URL to the root domain: {trimmedUrl}
        </p>
      )}

      <Button type="submit" variant="primary" block disabled={isSubmitting}>
        {isSubmitting ? 'Starting audit…' : 'Run my AEO audit'}
      </Button>

      {error && (
        <p id="audit-url-error" role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </form>
  );
}

export default AuditForm;
