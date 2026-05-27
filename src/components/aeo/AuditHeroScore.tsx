import { ProgressRing } from '@/components/ui';
import styles from './AuditHeroScore.module.css';

export interface AuditHeroScoreProps {
  score: number;
  grade: string;
  domain: string;
}

function gradeColorVar(grade: string): string {
  const letter = grade.trim().charAt(0).toLowerCase();
  if (['a', 'b', 'c', 'd', 'f'].includes(letter)) {
    return `var(--grade-${letter})`;
  }
  return 'var(--color-text-secondary)';
}

function gradeInterpretation(grade: string): string {
  switch (grade.trim().charAt(0).toUpperCase()) {
    case 'A':
      return 'Excellent AEO Presence';
    case 'B':
      return 'Strong Performance';
    case 'C':
      return 'Room for Improvement';
    case 'D':
      return 'Needs Attention';
    case 'F':
      return 'Critical Issues Detected';
    default:
      return 'AEO Performance';
  }
}

export function AuditHeroScore({
  score,
  grade,
  domain,
}: AuditHeroScoreProps) {
  const color = gradeColorVar(grade);
  const interpretation = gradeInterpretation(grade);

  return (
    <section className={styles.hero} aria-label="Overall AEO score">
      <div className={styles.ringWrap}>
        <ProgressRing
          value={score}
          max={100}
          size="lg"
          color={color}
          ariaLabel={`Overall AEO score ${score} of 100, grade ${grade}`}
        />
      </div>
      <span
        className={styles.gradeLetter}
        style={{ color }}
        aria-label={`Grade ${grade}`}
      >
        {grade}
      </span>
      <p className={styles.interpretation}>{interpretation}</p>
      <p className={styles.domain}>{domain}</p>
    </section>
  );
}

export default AuditHeroScore;
