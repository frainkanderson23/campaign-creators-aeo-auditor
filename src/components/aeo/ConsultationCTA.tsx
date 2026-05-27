import { Check } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './ConsultationCTA.module.css';

type GradeBucket = 'critical' | 'moderate' | 'strong';

export interface ConsultationCTAProps {
  grade: string;
  score: number;
  domain: string;
  onCTAClick?: () => void;
}

const HEADINGS: Record<GradeBucket, string> = {
  critical: 'Your AEO Presence Needs Urgent Attention',
  moderate: 'Turn Your AEO Opportunity Into Results',
  strong: 'Maintain and Extend Your AEO Lead',
};

const CHECKLISTS: Record<GradeBucket, string[]> = {
  critical: [
    'Diagnose the gaps blocking AI citations',
    'Build a 30-day remediation roadmap',
    'Recover lost visibility in AI answers',
  ],
  moderate: [
    'Identify your highest-impact quick wins',
    'Strengthen topical authority where it matters',
    'Convert AEO opportunity into measurable growth',
  ],
  strong: [
    'Monitor citation share across AI engines',
    'Defend topical authority from competitors',
    'Stay ahead of evolving AEO algorithms',
  ],
};

function bucketForGrade(grade: string): GradeBucket {
  switch (grade.trim().charAt(0).toUpperCase()) {
    case 'F':
    case 'D':
      return 'critical';
    case 'A':
    case 'B':
      return 'strong';
    case 'C':
    default:
      return 'moderate';
  }
}

export function ConsultationCTA({
  grade,
  score,
  domain,
  onCTAClick,
}: ConsultationCTAProps) {
  const bucket = bucketForGrade(grade);
  const heading = HEADINGS[bucket];
  const items = CHECKLISTS[bucket];

  return (
    <section className={styles.card} aria-label="Consultation call to action">
      <h3 className={styles.heading}>{heading}</h3>
      <p className={styles.context}>
        {domain} · Grade {grade.toUpperCase()} · Score {score}/100
      </p>
      <ul className={styles.checklist}>
        {items.map((item) => (
          <li key={item} className={styles.checkRow}>
            <span className={styles.checkIcon} aria-hidden>
              <Check size={14} strokeWidth={3} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button type="button" variant="primary" onClick={() => onCTAClick?.()}>
          Book a Free AEO Strategy Call
        </Button>
      </div>
    </section>
  );
}

export default ConsultationCTA;
