import { Lock } from 'lucide-react';
import styles from './AuditScoreCard.module.css';

export interface AuditScoreCardProps {
  score: number;
  grade: string;
  domain: string;
  locked: boolean;
  findings?: string[];
}

function gradeColorVar(grade: string): string {
  const letter = grade.trim().charAt(0).toLowerCase();
  if (['a', 'b', 'c', 'd', 'f'].includes(letter)) {
    return `var(--grade-${letter})`;
  }
  return 'var(--color-text-secondary)';
}

export function AuditScoreCard({
  score,
  grade,
  domain,
  locked,
  findings = [],
}: AuditScoreCardProps) {
  const bodyClass = [styles.body, locked ? styles.blurred : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.card}>
      <div className={bodyClass} aria-hidden={locked ? true : undefined}>
        <p className={styles.title}>AEO Score</p>
        <p className={styles.domain}>{domain}</p>
        <div className={styles.scoreRow}>
          <span className={styles.score}>{score}</span>
          <span className={styles.scoreMax}>/100</span>
          <span
            className={styles.gradeBadge}
            style={{ backgroundColor: gradeColorVar(grade) }}
            aria-label={`Grade ${grade}`}
          >
            {grade}
          </span>
        </div>
        {findings.length > 0 && (
          <ul className={styles.findings}>
            {findings.map((finding, idx) => (
              <li key={`${idx}-${finding}`} className={styles.findingItem}>
                {finding}
              </li>
            ))}
          </ul>
        )}
      </div>
      {locked && (
        <div className={styles.overlay} role="status" aria-label="Locked">
          <span className={styles.overlayIcon}>
            <Lock size={28} aria-hidden />
          </span>
          <p className={styles.overlayText}>Unlock to view your full score</p>
        </div>
      )}
    </div>
  );
}

export default AuditScoreCard;
