'use client';

import { useEffect, useState } from 'react';
import styles from './AuditHeroScore.module.css';

export interface AuditHeroScoreProps {
  score: number;
  grade: string;
  domain: string;
  locked?: boolean;
}

function gradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A':
    case 'B':
      return 'var(--good)';
    case 'C':
      return 'var(--warn)';
    case 'D':
    case 'F':
      return 'var(--bad)';
    default:
      return 'var(--ink-3)';
  }
}

export function AuditHeroScore({
  score,
  grade,
  domain,
  locked = false,
}: AuditHeroScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(locked ? score : 0);
  const radius = 110;
  const circ = 2 * Math.PI * radius;
  const color = gradeColor(grade);

  useEffect(() => {
    if (locked) {
      setAnimatedScore(score);
      return;
    }
    let raf: number;
    let start: number | undefined;
    const dur = 1400;
    const tick = (t: number) => {
      if (start === undefined) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, locked]);

  const offset = circ - (animatedScore / 100) * circ;

  return (
    <section
      className={[styles.hero, locked ? styles.locked : ''].filter(Boolean).join(' ')}
      aria-label="Overall AEO score"
    >
      <p className={styles.domain}>{domain}</p>
      <div className={styles.ringWrap}>
        <svg width="260" height="260" viewBox="0 0 260 260" aria-hidden>
          <circle
            className={styles.ringBg}
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            strokeWidth="14"
          />
          <circle
            className={styles.ringFill}
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ stroke: color }}
          />
        </svg>
        <div className={styles.ringInner}>
          <div className={styles.scoreNum}>
            {animatedScore}
            <span className={styles.scoreTotal}>/100</span>
          </div>
          <span className={styles.gradeBadge} style={{ color }}>
            Grade {grade}
          </span>
        </div>
      </div>
    </section>
  );
}

export default AuditHeroScore;
