import { LockIcon } from '@/components/ui';
import styles from './AuditScoreCard.module.css';

export interface AuditScoreCardFinding {
  label: string;
  value: string;
}

export interface AuditScoreCardProps {
  locked?: boolean;
  score?: number;
  findings?: AuditScoreCardFinding[];
}

const DEFAULT_FINDINGS: AuditScoreCardFinding[] = [
  { label: 'Schema Coverage', value: '40%' },
  { label: 'Citation Signals', value: '3/10' },
  { label: 'Authority Score', value: '58' },
];

export function AuditScoreCard({
  locked = false,
  score = 62,
  findings = DEFAULT_FINDINGS,
}: AuditScoreCardProps) {
  const bodyClass = [styles.body, locked ? styles.blurred : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.card}>
      <div className={bodyClass} aria-hidden={locked ? true : undefined}>
        <p className={styles.title}>AEO Score</p>
        <div className={styles.scoreRow}>
          <span className={styles.score}>{score}</span>
          <span className={styles.scoreMax}>/100</span>
        </div>
        <ul className={styles.findings}>
          {findings.map((f) => (
            <li key={f.label} className={styles.findingRow}>
              <span className={styles.findingLabel}>{f.label}</span>
              <span className={styles.findingValue}>{f.value}</span>
            </li>
          ))}
        </ul>
      </div>
      {locked && (
        <div className={styles.overlay} role="status" aria-label="Locked">
          <span className={styles.overlayIcon}>
            <LockIcon size={24} />
          </span>
          <p className={styles.overlayText}>Unlock to view your full score</p>
        </div>
      )}
    </div>
  );
}

export default AuditScoreCard;
