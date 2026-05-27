'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import styles from './EmailGateOverlay.module.css';

export interface EmailGateOverlayProps {
  onUnlock: (email: string) => void;
}

export function EmailGateOverlay({ onUnlock }: EmailGateOverlayProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    onUnlock(trimmed);
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
        />
        <Button type="submit" variant="primary">
          Get My Report
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
