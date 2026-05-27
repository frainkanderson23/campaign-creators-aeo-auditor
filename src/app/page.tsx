'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!domain.trim() || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Something went wrong. Try again.');
        setSubmitting(false);
        return;
      }

      const data = (await res.json()) as { auditId: string };
      router.push(`/audit/${data.auditId}`);
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-xl py-32">
        <div className="space-y-10 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-[#0F172A]">
              How visible is your brand in AI&nbsp;search?
            </h1>
            <p className="text-lg text-[#475569] leading-relaxed">
              Enter your domain. Get an instant AEO health score.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label htmlFor="domain" className="sr-only">
              Domain
            </label>
            <input
              id="domain"
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
              placeholder="yourcompany.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-[#E2E8F0] bg-white px-5 py-4 text-base text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={submitting || !domain.trim()}
              className="w-full rounded-lg px-5 py-4 text-base font-medium text-white transition disabled:opacity-60"
              style={{ backgroundColor: '#2563EB' }}
            >
              {submitting ? 'Starting audit…' : 'Run my AEO audit'}
            </button>
            {error && (
              <p className="text-sm text-[#EF4444]" role="alert">
                {error}
              </p>
            )}
          </form>

          <p className="text-sm text-[#64748B]">
            Free. No signup required. Results in 30 seconds.
          </p>
        </div>
      </div>
    </main>
  );
}
