'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import styles from './AuditForm.module.css';

const TRUST_SIGNALS = [
  'No credit card required',
  'Results in 30 seconds',
  '10,000+ businesses analyzed',
] as const;

export function AuditForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!url.trim()) {
      setError('Please enter a URL to analyze');
      return;
    }

    setError(null);
    console.log(url);
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
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'audit-url-error' : undefined}
        className={styles.input}
      />

      <Button type="submit" variant="primary" size="lg" block>
        Analyze My AEO Score
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
