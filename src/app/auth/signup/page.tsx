'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import styles from '../auth.module.css';

export default function SignupPage() {
  const signupEnabled = process.env.NEXT_PUBLIC_SIGNUP_ENABLED === 'true';

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setConfirmMessage(null);
    setSubmitting(true);

    const { data, error: signUpError } = await createSupabaseBrowser().auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    const hasSession = Boolean(data?.session);

    if (hasSession) {
      router.push('/');
      return;
    }

    setConfirmMessage('Check your email to confirm your account.');
    setSubmitting(false);
  }

  if (!signupEnabled) {
    return (
      <section className={styles.page}>
        <div className={styles.bg} aria-hidden="true">
          <div className={styles.grid} />
        </div>

        <div className={styles.card}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            AEO Auditor
          </span>

          <h1 className={styles.title}>Sign-up</h1>
          <p className={styles.subtitle}>
            We&apos;re onboarding teams gradually while we tune the platform.
          </p>

          <div className={styles.invite}>
            <span className={styles.inviteLabel}>Invite only</span>
            <p className={styles.inviteText}>
              Sign-up is currently invite-only. Reach out to your Campaign Creators
              contact to request access.
            </p>
          </div>

          <div className={styles.foot}>
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.grid} />
      </div>

      <div className={styles.card}>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          AEO Auditor
        </span>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Start auditing your brand&apos;s visibility in AI search.
        </p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'signup-error' : undefined}
              className={styles.input}
              placeholder="you@company.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'signup-error' : undefined}
              className={styles.input}
            />
          </div>

          {error && (
            <p id="signup-error" role="alert" className={styles.error}>
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className={styles.submit}>
            {submitting ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {confirmMessage && (
          <p className={styles.success} role="status">
            {confirmMessage}
          </p>
        )}

        <div className={styles.foot}>
          Already have an account? <Link href="/auth/login">Sign in</Link>
        </div>
      </div>
    </section>
  );
}
