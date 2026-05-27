import { Lock } from 'lucide-react';
import styles from './AuditScoreCard.module.css';

export interface AuditScoreCardProps {
  label: string;
  score: number;
  grade: string;
  locked?: boolean;
}

function gradeColor(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A':
      return 'var(--grade-a)';
    case 'B':
      return 'var(--grade-b)';
    case 'C':
      return 'var(--grade-c)';
    case 'D':
      return 'var(--grade-d)';
    case 'F':
      return 'var(--grade-f)';
    default:
      return 'var(--color-text-secondary)';
  }
}

export function AuditScoreCard({
  label,
  score,
  grade,
  locked = false,
}: AuditScoreCardProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = gradeColor(grade);
  const bodyClass = [styles.body, locked ? styles.blurred : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article className={styles.card}>
      <div className={bodyClass} aria-hidden={locked ? true : undefined}>
        <header className={styles.header}>
          <h3 className={styles.label}>{label}</h3>
          <span
            className={styles.badge}
            style={{ backgroundColor: color }}
            aria-label={`Grade ${grade}`}
          >
            {grade}
          </span>
        </header>
        <div className={styles.scoreRow}>
          <span className={styles.score}>{clamped}</span>
          <span className={styles.scoreMax}>/100</span>
        </div>
        <div className={styles.barTrack} aria-hidden>
          <div
            className={styles.barFill}
            style={{ width: `${clamped}%`, backgroundColor: color }}
          />
        </div>
      </div>
      {locked && (
        <div className={styles.overlay} role="status" aria-label="Locked">
          <span className={styles.overlayIcon}>
            <Lock width={24} height={24} aria-hidden />
          </span>
        </div>
      )}
    </article>
  );
}

export default AuditScoreCard;
