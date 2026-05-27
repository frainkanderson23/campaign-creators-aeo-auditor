'use client';

import { useState, type FormEvent } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/browser';

export default function SignupPage() {
  const signupEnabled = process.env.NEXT_PUBLIC_SIGNUP_ENABLED === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    const { error: signUpError } = await createSupabaseBrowser().auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  if (!signupEnabled) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="card w-full max-w-md text-center">
          <h1 className="heading-display text-2xl mb-2">Sign up</h1>
          <p className="muted">Sign-ups are currently invite-only.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="card w-full max-w-md">
        <header className="mb-6 space-y-2">
          <h1 className="heading-display text-2xl">Create your account</h1>
          <p className="muted text-sm">Start auditing your AEO health.</p>
        </header>

        {success ? (
          <p className="form-success" role="status">
            Check your email to confirm your account.
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
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
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                aria-invalid={error ? true : undefined}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                aria-invalid={error ? true : undefined}
                className="input"
              />
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-block"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
