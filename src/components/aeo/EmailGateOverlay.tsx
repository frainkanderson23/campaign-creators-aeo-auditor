'use client';

import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import styles from './EmailGateOverlay.module.css';

export interface EmailGateOverlayProps {
  auditRequestId: string;
  onUnlocked: (email: string, result: unknown) => void;
}

const INVALID_EMAIL_MESSAGE = 'Please enter a valid email address.';
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function EmailGateOverlay({
  auditRequestId,
  onUnlocked,
}: EmailGateOverlayProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/audit/${auditRequestId}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.status === 200 || response.status === 409) {
        const result = await response.json();
        setIsLoading(false);
        onUnlocked(email.trim(), result);
        return;
      }

      if (response.status === 400) {
        setError(INVALID_EMAIL_MESSAGE);
        setIsLoading(false);
        return;
      }

      setError(GENERIC_ERROR_MESSAGE);
      setIsLoading(false);
    } catch {
      setError(GENERIC_ERROR_MESSAGE);
      setIsLoading(false);
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
          aria-describedby={error ? 'email-gate-error' : undefined}
          disabled={isLoading}
        />
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <span className={styles.loadingLabel}>
              <Loader2
                width={16}
                height={16}
                className={styles.spinner}
                aria-hidden
              />
              Unlocking…
            </span>
          ) : (
            'Get My Report'
          )}
        </Button>
      </form>
      {error && (
        <p id="email-gate-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export default EmailGateOverlay;
