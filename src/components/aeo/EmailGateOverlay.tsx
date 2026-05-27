'use client';

import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';
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
    const value = email.trim();
    if (!value) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    onUnlock(value);
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="email-gate-title">
      <section className={styles.card} aria-label="Unlock full report">
        <span className={styles.iconWrap}>
          <Lock size={32} aria-hidden />
        </span>
        <h2 id="email-gate-title" className={styles.title}>
          Unlock Your Full AEO Report
        </h2>
        <p className={styles.subtitle}>
          See your complete findings and recommendations in seconds.
        </p>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter your work email"
            aria-label="Work email"
            aria-invalid={error ? 'true' : undefined}
          />
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" block>
            Unlock My Report
          </Button>
        </form>
        <p className={styles.privacy}>We respect your privacy. No spam, ever.</p>
      </section>
    </div>
  );
}

export default EmailGateOverlay;
