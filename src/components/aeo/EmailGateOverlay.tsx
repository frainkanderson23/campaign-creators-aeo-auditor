'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, LockIcon } from '@/components/ui';
import styles from './EmailGateOverlay.module.css';

export interface EmailGateOverlayProps {
  onUnlock?: (email: string) => void;
  domain?: string;
}

const defaultUnlock = () => {};

export function EmailGateOverlay({
  onUnlock = defaultUnlock,
  domain = 'example.com',
}: EmailGateOverlayProps) {
  const [email, setEmail] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onUnlock(email);
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
        />
        <Button type="submit" variant="primary" block>
          Unlock My Report
        </Button>
      </form>
      <p className={styles.privacy}>We respect your privacy. No spam, ever.</p>
    </section>
  );
}

export default EmailGateOverlay;
