'use client';

import { useState, type FormEvent } from 'react';
import styles from './AuditForm.module.css';

export function AuditForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) {
      setError('Please enter your website URL');
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
      <input
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

      <button type="submit" className={styles.submit}>
        Analyze My AEO Score
      </button>

      {error && (
        <p id="audit-url-error" role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </form>
  );
}

export default AuditForm;
