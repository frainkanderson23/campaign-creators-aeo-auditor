import { ProgressRing, type ProgressRingGrade } from '@/components/ui';
import { getGradeInterpretation } from '@/lib/gradeInterpretation';
import styles from './AuditHeroScore.module.css';

export interface AuditHeroScoreProps {
  score?: number;
  grade?: string;
  domain?: string;
}

const VALID_GRADES: ProgressRingGrade[] = ['A', 'B', 'C', 'D', 'F'];

function normalizeGrade(grade: string): ProgressRingGrade {
  const upper = grade.toUpperCase();
  return (VALID_GRADES as string[]).includes(upper)
    ? (upper as ProgressRingGrade)
    : 'C';
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

function shortInterpretation(grade: string): string {
  switch (grade.toUpperCase()) {
    case 'A':
      return 'Your AEO presence is excellent — keep defending your lead.';
    case 'B':
      return 'Strong AEO foundation with room for targeted gains.';
    case 'C':
      return 'Your AEO presence has room to grow.';
    case 'D':
      return 'Weak AEO signals — meaningful work is needed.';
    case 'F':
      return 'Critical AEO gaps — immediate action required.';
    default:
      return getGradeInterpretation(grade);
  }
}

export function AuditHeroScore({
  score = 62,
  grade = 'C',
  domain = 'example.com',
}: AuditHeroScoreProps) {
  const color = gradeColor(grade);
  return (
    <section className={styles.hero} aria-label="Overall AEO score">
      <p className={styles.domain}>{domain}</p>
      <div className={styles.ringWrap}>
        <ProgressRing score={score} grade={normalizeGrade(grade)} size="lg" />
      </div>
      <span
        className={styles.gradeBadge}
        style={{ backgroundColor: color }}
        aria-label={`Grade ${grade}`}
      >
        Grade {grade}
      </span>
      <p className={styles.interpretation}>{shortInterpretation(grade)}</p>
    </section>
  );
}

export default AuditHeroScore;
