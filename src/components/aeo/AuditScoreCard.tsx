import { Lock } from 'lucide-react';
import styles from './AuditScoreCard.module.css';

export interface AuditScoreCardProps {
  category: string;
  score: number;
  insight: string;
  locked?: boolean;
}

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--good)';
  if (score >= 50) return 'var(--warn)';
  return 'var(--bad)';
}

export function AuditScoreCard({
  category,
  score,
  insight,
  locked = false,
}: AuditScoreCardProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = scoreColor(clamped);
  const bodyClass = [styles.body, locked ? styles.blurred : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article className={styles.card}>
      <div className={bodyClass} aria-hidden={locked ? true : undefined}>
        <header className={styles.header}>
          <h3 className={styles.label}>{category}</h3>
          {!locked && (
            <span className={styles.badge} style={{ color }}>
              {clamped}
            </span>
          )}
        </header>
        <div className={styles.barTrack} aria-hidden>
          <div
            className={styles.barFill}
            style={{
              width: `${locked ? 50 : clamped}%`,
              backgroundColor: locked ? 'var(--line-strong)' : color,
            }}
          />
        </div>
        {!locked && insight && <p className={styles.insight}>{insight}</p>}
      </div>
      {locked && (
        <div className={styles.overlay} role="status" aria-label="Locked">
          <span className={styles.overlayIcon}>
            <Lock width={20} height={20} aria-hidden />
          </span>
        </div>
      )}
    </article>
  );
}

export default AuditScoreCard;
