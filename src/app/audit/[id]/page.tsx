'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  CHECK_LABELS,
  CHECK_ORDER,
  GRADE_COLORS,
  type AuditResult,
  type CheckId,
  type CheckResult,
  type Grade,
} from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AuditPage({ params }: PageProps) {
  const { id } = use(params);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const res = await fetch(`/api/audit/${id}`, { cache: 'no-store' });
        if (cancelled) return;

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          timer = setTimeout(poll, 2000);
          return;
        }

        const data = (await res.json()) as AuditResult;
        if (cancelled) return;

        setAudit(data);

        if (data.status === 'processing') {
          timer = setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) timer = setTimeout(poll, 2000);
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  if (notFound) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold text-[#0F172A]">Audit not found</h1>
          <p className="text-[#475569]">
            That audit ID doesn’t exist. It may have expired (audits are kept in
            memory for the MVP).
          </p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-[#2563EB] underline-offset-2 hover:underline"
          >
            Run a new audit
          </Link>
        </div>
      </main>
    );
  }

  if (!audit) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <p className="text-[#475569]">Loading audit…</p>
      </main>
    );
  }

  if (audit.status === 'error') {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center space-y-3 max-w-md">
          <h1 className="text-2xl font-semibold text-[#0F172A]">
            Something went wrong
          </h1>
          <p className="text-[#475569]">{audit.error ?? 'Unknown error.'}</p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-[#2563EB] underline-offset-2 hover:underline"
          >
            Try another domain
          </Link>
        </div>
      </main>
    );
  }

  if (audit.status === 'processing') {
    return <ProcessingView audit={audit} />;
  }

  return (
    <ResultsView
      audit={audit}
      emailUnlocked={emailUnlocked}
      onUnlock={() => setEmailUnlocked(true)}
    />
  );
}

function ProcessingView({ audit }: { audit: AuditResult }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-xl py-24 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-widest text-[#64748B]">
            Auditing
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">
            {audit.domain}
          </h1>
          <p className="text-[#475569]">
            Running 4 checks. Hold tight — this takes about 30 seconds.
          </p>
        </div>

        <ul className="space-y-3">
          {CHECK_ORDER.map((checkId) => (
            <ChecklistRow key={checkId} check={audit.checks[checkId]} />
          ))}
        </ul>
      </div>
    </main>
  );
}

function ChecklistRow({ check }: { check: CheckResult }) {
  const isComplete = check.status === 'complete';
  const isRunning = check.status === 'running';
  const isError = check.status === 'error';

  return (
    <li className="flex items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white px-5 py-4 transition">
      <span
        className={
          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition ' +
          (isComplete
            ? 'bg-[#10B981] text-white'
            : isError
              ? 'bg-[#EF4444] text-white'
              : isRunning
                ? 'bg-[#2563EB]/10 text-[#2563EB]'
                : 'bg-[#F1F5F9] text-[#94A3B8]')
        }
        aria-hidden
      >
        {isComplete ? (
          <CheckIcon />
        ) : isError ? (
          '!'
        ) : isRunning ? (
          <Spinner />
        ) : (
          ''
        )}
      </span>
      <span
        className={
          'text-base ' +
          (isComplete
            ? 'text-[#0F172A]'
            : isRunning
              ? 'text-[#0F172A]'
              : 'text-[#94A3B8]')
        }
      >
        {check.label}
      </span>
    </li>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 6.5L5 9L9.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"
      role="status"
      aria-label="Running"
    />
  );
}

function ResultsView({
  audit,
  emailUnlocked,
  onUnlock,
}: {
  audit: AuditResult;
  emailUnlocked: boolean;
  onUnlock: () => void;
}) {
  const overall = audit.overallScore ?? 0;
  const grade: Grade = audit.overallGrade ?? 'F';

  const visibleChecks: CheckId[] = emailUnlocked
    ? CHECK_ORDER
    : CHECK_ORDER.slice(0, 2);

  return (
    <main className="flex-1 px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-12">
        <header className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-widest text-[#64748B]">
            AEO Audit
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0F172A]">
            {audit.domain}
          </h1>
        </header>

        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ScoreGauge score={overall} grade={grade} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm uppercase tracking-widest text-[#64748B]">
                Overall AEO score
              </p>
              <p className="mt-2 text-4xl font-semibold text-[#0F172A]">
                {overall}
                <span className="text-2xl text-[#94A3B8]">/100</span>
              </p>
              <p className="mt-3 text-[#475569]">
                {scoreCommentary(overall)}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Category breakdown
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {CHECK_ORDER.map((id) => (
              <CategorySummaryCard
                key={id}
                check={audit.checks[id]}
                label={CHECK_LABELS[id]}
              />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          {visibleChecks.map((id) => (
            <CategoryDetail key={id} check={audit.checks[id]} />
          ))}
        </section>

        {!emailUnlocked && (
          <EmailGate
            checksRemaining={CHECK_ORDER.length - visibleChecks.length}
            onUnlock={onUnlock}
          />
        )}

        {emailUnlocked && (
          <section className="rounded-2xl border border-[#0F172A] bg-[#0F172A] p-8 sm:p-10 text-center text-white">
            <h2 className="text-2xl font-semibold">
              Ready to fix your AEO score?
            </h2>
            <p className="mt-3 text-[#CBD5E1]">
              Campaign Creators helps brands like yours dominate AI search.
              Book a free 30-minute consultation to walk through these findings.
            </p>
            <a
              href="https://www.campaigncreators.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-lg px-6 py-3 text-base font-medium transition"
              style={{ backgroundColor: '#2563EB' }}
            >
              Book a free AEO consultation with Campaign Creators
            </a>
          </section>
        )}
      </div>
    </main>
  );
}

function scoreCommentary(score: number): string {
  if (score >= 90)
    return 'Excellent. Your site is well-prepared for AI search engines.';
  if (score >= 80) return 'Strong foundation, with a few high-leverage fixes.';
  if (score >= 70) return 'Decent — meaningful gaps that are worth closing.';
  if (score >= 60) return 'Below baseline. AI assistants will struggle to cite you.';
  return 'Critical. Your brand is largely invisible to AI search today.';
}

function ScoreGauge({ score, grade }: { score: number; grade: Grade }) {
  const radius = 52;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = GRADE_COLORS[grade];

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg
        width="128"
        height="128"
        viewBox="0 0 128 128"
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className="absolute text-3xl font-semibold"
        style={{ color }}
      >
        {grade}
      </span>
    </div>
  );
}

function CategorySummaryCard({
  check,
  label,
}: {
  check: CheckResult;
  label: string;
}) {
  const color = GRADE_COLORS[check.grade];
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#475569]">{label}</p>
        <span
          className="rounded-md px-2.5 py-1 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {check.grade}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-[#0F172A]">
        {check.score}
        <span className="text-base text-[#94A3B8]">/100</span>
      </p>
    </div>
  );
}

function CategoryDetail({ check }: { check: CheckResult }) {
  const color = GRADE_COLORS[check.grade];
  const findings = check.findings.slice(0, 3);
  const recommendations = check.recommendations.slice(0, 3);

  return (
    <article className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8">
      <header className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-[#0F172A]">{check.label}</h3>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#0F172A]">
            {check.score}/100
          </span>
          <span
            className="rounded-md px-3 py-1 text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {check.grade}
          </span>
        </div>
      </header>

      {findings.length > 0 && (
        <div className="mt-5 space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#64748B]">
            Findings
          </h4>
          <ul className="space-y-1.5">
            {findings.map((f, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-[#334155] leading-relaxed"
              >
                <SeverityDot severity={f.severity} />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-5 space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#64748B]">
            Recommendations
          </h4>
          <ul className="space-y-1.5">
            {recommendations.map((r, i) => (
              <li
                key={i}
                className="text-sm text-[#334155] leading-relaxed before:mr-2 before:text-[#94A3B8] before:content-['→']"
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function SeverityDot({ severity }: { severity: 'info' | 'warning' | 'critical' }) {
  const color =
    severity === 'critical' ? '#EF4444' : severity === 'warning' ? '#F59E0B' : '#10B981';
  return (
    <span
      className="mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

function EmailGate({
  checksRemaining,
  onUnlock,
}: {
  checksRemaining: number;
  onUnlock: () => void;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email.');
      return;
    }
    setError(null);
    onUnlock();
  }

  return (
    <section className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 sm:p-10 text-center">
      <h2 className="text-xl font-semibold text-[#0F172A]">
        Unlock the full report
      </h2>
      <p className="mt-2 text-[#475569]">
        {checksRemaining} more {checksRemaining === 1 ? 'category' : 'categories'}{' '}
        with findings and recommendations are waiting. Enter your email to see
        them.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="flex-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-base text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
        <button
          type="submit"
          className="rounded-lg px-5 py-3 text-base font-medium text-white"
          style={{ backgroundColor: '#2563EB' }}
        >
          Unlock report
        </button>
      </form>
      {error && (
        <p className="mt-3 text-sm text-[#EF4444]" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
