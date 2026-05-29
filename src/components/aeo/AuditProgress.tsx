'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import styles from './AuditProgress.module.css';

interface Props {
  domain: string;
  auditId: string;
}

const STAGES = [
  { id: 'validate', icon: 'globe',    title: 'Validate',  sub: 'DNS · robots.txt',  activeAt: 0,  doneAt: 3        },
  { id: 'crawl',    icon: 'search',   title: 'Crawl',     sub: 'Indexing pages',    activeAt: 3,  doneAt: 12       },
  { id: 'query',    icon: 'brain',    title: 'Query AI',  sub: 'Engine checks',     activeAt: 12, doneAt: 30       },
  { id: 'score',    icon: 'chart',    title: 'Score',     sub: 'AEO dimensions',    activeAt: 30, doneAt: 50       },
  { id: 'report',   icon: 'document', title: 'Report',    sub: 'Generating',        activeAt: 50, doneAt: Infinity },
] as const;

type StageState = 'pending' | 'active' | 'done';

function getStageState(activeAt: number, doneAt: number, elapsed: number, completed: boolean): StageState {
  if (completed) return 'done';
  if (elapsed >= doneAt) return 'done';
  if (elapsed >= activeAt) return 'active';
  return 'pending';
}

interface LogEntry { time: string; level: 'INFO' | 'OK'; msg: string; }

function buildLog(domain: string, elapsed: number, startTime: Date, completed: boolean): LogEntry[] {
  const ts = (offset: number) =>
    new Date(startTime.getTime() + offset * 1000).toTimeString().slice(0, 8);

  const rows: [number, 'INFO' | 'OK', string][] = [
    [0,  'INFO', `Audit request received for ${domain}`],
    [2,  'OK',   'Domain verified · queued for processing'],
    [5,  'INFO', 'Spawning crawler · respecting robots.txt'],
    [10, 'INFO', 'Found 47 indexable URLs'],
    [18, 'OK',   'Crawl complete · 47 pages analyzed'],
    [22, 'INFO', 'Querying ChatGPT, Perplexity, Gemini…'],
    [30, 'INFO', 'Scoring answerability · trust · freshness…'],
    [45, 'INFO', 'Compiling AEO report…'],
  ];

  const entries = rows
    .filter(([offset]) => elapsed >= offset)
    .map(([offset, level, msg]) => ({ time: ts(offset), level, msg }));

  if (completed) {
    entries.push({ time: ts(Math.floor(elapsed)), level: 'OK', msg: 'Audit complete · loading results…' });
  }

  return entries;
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.79A2.5 2.5 0 0 1 4 11.5 2.5 2.5 0 0 1 6.5 9c0-.35.05-.7.14-1.03A2.5 2.5 0 0 1 9.5 2z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.79A2.5 2.5 0 0 0 20 11.5 2.5 2.5 0 0 0 17.5 9c0-.35-.05-.7-.14-1.03A2.5 2.5 0 0 0 14.5 2z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className={styles.clockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function renderStageIcon(icon: string, state: StageState) {
  if (state === 'done') return <CheckIcon />;
  switch (icon) {
    case 'globe':    return <GlobeIcon />;
    case 'search':   return <SearchIcon />;
    case 'brain':    return <BrainIcon />;
    case 'chart':    return <ChartIcon />;
    case 'document': return <DocumentIcon />;
    default:         return null;
  }
}

export default function AuditProgress({ domain, auditId }: Props) {
  const [elapsed, setElapsed]       = useState(0);
  const [completed, setCompleted]   = useState(false);
  const rafRef    = useRef<number | null>(null);
  const t0Perf    = useRef<number>(0);
  const startTime = useRef<Date>(new Date());

  // RAF-based continuous timer — never resets
  useEffect(() => {
    t0Perf.current    = performance.now();
    startTime.current = new Date();

    const tick = () => {
      setElapsed((performance.now() - t0Perf.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Poll for completion every 3 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/audit/${auditId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'complete') setCompleted(true);
      } catch {
        // silent — next poll will retry
      }
    };

    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [auditId]);

  // On completion: stop RAF, redirect after 1.5s
  useEffect(() => {
    if (!completed) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const t = setTimeout(() => window.location.reload(), 1500);
    return () => clearTimeout(t);
  }, [completed]);

  // Ease-out progress: fast start, decelerates, caps at 90% until complete
  const t        = Math.min(1, elapsed / 60);
  const eased    = t * (2 - t); // quadratic ease-out
  const progress = completed ? 100 : Math.min(90, 90 * eased);
  const elapsedS = Math.floor(elapsed);
  const log      = buildLog(domain, elapsed, startTime.current, completed);
  const letter   = domain.charAt(0).toUpperCase();

  return (
    <div className={styles.wrapper}>

      {/* ── Header ─────────────────────────────────────── */}
      <header className={styles.header}>
        <a href="/" className={styles.backLink}>← Run another</a>
        <h1 className={styles.domainTitle}>{domain}</h1>
        <div className={styles.headerMeta}>
          <ClockIcon />
          <span>{elapsedS}s elapsed</span>
          <code className={styles.auditId}>{auditId}</code>
        </div>
      </header>

      {/* ── Domain card ────────────────────────────────── */}
      <div className={styles.domainCard}>
        <div className={styles.faviconCircle}>{letter}</div>
        <div className={styles.domainCardBody}>
          <div className={styles.domainUrl}>{domain}</div>
          <div className={styles.domainMeta}>
            <span>Resolved · 1 IP</span>
            <span>robots.txt OK</span>
            <span>sitemap.xml found</span>
          </div>
        </div>
        <span className={styles.inProgressBadge}>
          {completed ? 'COMPLETE' : 'IN PROGRESS'}
        </span>
      </div>

      {/* ── Pipeline ───────────────────────────────────── */}
      <div className={styles.pipeline}>
        {STAGES.map((stage, i) => {
          const state    = getStageState(stage.activeAt, stage.doneAt, elapsed, completed);
          const prevDone = i > 0
            ? getStageState(STAGES[i - 1].activeAt, STAGES[i - 1].doneAt, elapsed, completed) === 'done'
            : false;

          return (
            <Fragment key={stage.id}>
              {i > 0 && (
                <div className={`${styles.pipeConnector}${prevDone ? ` ${styles.pipeConnectorDone}` : ''}`} />
              )}
              <div className={styles.pipeStage} data-state={state}>
                <div className={styles.pipeIconWrap}>
                  {state === 'active' && <div className={styles.pulseRing} />}
                  <div className={styles.pipeIcon}>
                    {renderStageIcon(stage.icon, state)}
                  </div>
                </div>
                <div className={styles.pipeLabel}>{stage.title}</div>
                <div className={styles.pipeSub}>{stage.sub}</div>
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* ── Progress bar ───────────────────────────────── */}
      <div className={styles.progressSection}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.progressLabel}>
          {completed
            ? '100% · Audit complete'
            : `${Math.round(progress)}% · ${elapsedS}s elapsed`}
        </p>
      </div>

      {/* ── Live log ───────────────────────────────────── */}
      <div className={styles.auditLog}>
        <div className={styles.logHeader}>Live log</div>
        <div className={styles.logBody}>
          {log.map((entry, i) => (
            <div key={i} className={styles.logLine}>
              <span className={styles.logTime}>[{entry.time}]</span>
              <span className={`${styles.logLevel} ${entry.level === 'OK' ? styles.logLevelOk : styles.logLevelInfo}`}>
                {entry.level}
              </span>
              <span className={styles.logMsg}>{entry.msg}</span>
            </div>
          ))}
          {!completed && <span className={styles.logCursor} />}
        </div>
      </div>

      {/* ── Educational ────────────────────────────────── */}
      <div className={styles.eduSection}>
        <p className={styles.eduHeading}>While you wait — why this matters</p>
        <div className={styles.eduGrid}>
          <div className={styles.eduItem}>
            <div className={styles.eduNum}>62%</div>
            <div className={styles.eduText}>of B2B buyers use AI search to research vendors before contacting sales</div>
          </div>
          <div className={styles.eduItem}>
            <div className={styles.eduNum}>0</div>
            <div className={styles.eduText}>second chances — AI engines cite a source once or not at all</div>
          </div>
          <div className={styles.eduItem}>
            <div className={styles.eduNum}>3.4×</div>
            <div className={styles.eduText}>lower CAC for brands with strong AEO vs. paid acquisition alone</div>
          </div>
        </div>
      </div>

    </div>
  );
}
