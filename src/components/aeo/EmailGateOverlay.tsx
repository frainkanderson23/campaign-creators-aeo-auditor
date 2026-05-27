'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, LockIcon } from '@/components/ui';
import styles from './EmailGateOverlay.module.css';

export interface EmailGateOverlayProps {
  onUnlock?: (email: string) => void;
  domain?: string;
  apiEndpoint?: string;
}

const defaultUnlock = () => {};

export function EmailGateOverlay({
  onUnlock = defaultUnlock,
  domain = 'example.com',
  apiEndpoint = '/api/email-gate',
}: EmailGateOverlayProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, domain }),
      });

      if (res.status >= 500 && res.status < 600) {
        setError('Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onUnlock(email);
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.overlay} aria-label="Unlock full report">
      <span className={styles.iconWrap}>
        <LockIcon size={28} />
      </span>
      <h2 className={styles.title}>Unlock Your Full AEO Report</h2>
      <p className={styles.subtitle}>
        See the complete findings and recommendations for{' '}
        <strong>{domain}</strong>.
      </p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email"
          aria-label="Work email"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          variant="primary"
          block
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Unlocking…' : 'Unlock My Report'}
        </Button>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </form>
      <p className={styles.privacy}>We respect your privacy. No spam, ever.</p>
    </section>
  );
}

export default EmailGateOverlay;
