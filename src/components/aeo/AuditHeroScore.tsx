import { ProgressRing } from '@/components/ui';
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

export function AuditHeroScore({
  score,
  grade,
  domain,
  locked = false,
}: AuditHeroScoreProps) {
  const color = gradeColor(grade);
  const ringClass = [styles.ringWrap, locked ? styles.blurred : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={styles.hero} aria-label="Overall AEO score">
      <p className={styles.domain}>{domain}</p>
      <div className={ringClass}>
        <ProgressRing
          value={score}
          max={100}
          size="lg"
          color={color}
          ariaLabel={`Overall AEO score ${score} of 100, grade ${grade}`}
        />
      </div>
      <span
        className={styles.gradeBadge}
        style={{ backgroundColor: color }}
        aria-label={`Grade ${grade}`}
      >
        Grade {grade}
      </span>
    </section>
  );
}

export default AuditHeroScore;
