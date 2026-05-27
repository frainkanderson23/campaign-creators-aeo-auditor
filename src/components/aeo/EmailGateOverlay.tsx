'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import styles from './EmailGateOverlay.module.css';

export interface EmailGateOverlayProps {
  onUnlock: (email: string) => void;
}

const SERVER_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function EmailGateOverlay({ onUnlock }: EmailGateOverlayProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/email-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      if (response.status >= 500 && response.status < 600) {
        setError(SERVER_ERROR_MESSAGE);
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        let message = SERVER_ERROR_MESSAGE;
        try {
          const data = (await response.json()) as { error?: string };
          if (data?.error) message = data.error;
        } catch {
          // ignore JSON parse failure; use default message
        }
        setError(message);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onUnlock(trimmed);
    } catch {
      setError(SERVER_ERROR_MESSAGE);
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.overlay} aria-label="Unlock full report">
      <div className={styles.text}>
        <h2 className={styles.title}>Unlock Your Full Report</h2>
        <p className={styles.subtitle}>
          Enter your email to see all scores and recommendations.
        </p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Work email"
          aria-invalid={error ? true : undefined}
          disabled={isSubmitting}
        />
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Get My Report'}
        </Button>
      </form>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export default EmailGateOverlay;
