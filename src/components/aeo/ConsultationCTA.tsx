import { Button, CheckIcon } from '@/components/ui';
import styles from './ConsultationCTA.module.css';

type GradeBucket = 'critical' | 'moderate' | 'strong';

export interface ConsultationCTAProps {
  grade?: string;
  score?: number;
  domain?: string;
  onCTAClick?: () => void;
}

const HEADINGS: Record<GradeBucket, string> = {
  critical: 'Your AEO Presence Is Critically Underoptimized — Act Now',
  moderate: "There's a Real Opportunity to Grow Your AI Visibility",
  strong: "You're Ahead — Let's Keep You There",
};

const CHECKLISTS: Record<GradeBucket, string[]> = {
  critical: [
    'Fix critical schema gaps',
    'Establish authority signals',
    'Recover missed AI citations',
  ],
  moderate: [
    'Expand schema coverage',
    'Strengthen topical authority',
    'Capture more AI citation opportunities',
  ],
  strong: [
    'Monitor citation trends',
    'Defend topical authority',
    'Stay ahead of AEO algorithm changes',
  ],
};

const CTA_LABELS: Record<GradeBucket, string> = {
  critical: 'Get Emergency AEO Help',
  moderate: 'Book a Free AEO Strategy Call',
  strong: 'Talk to an AEO Expert',
};

function bucketForGrade(grade: string): GradeBucket {
  switch (grade.toUpperCase()) {
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
  grade = 'C',
  score = 62,
  domain = 'example.com',
  onCTAClick,
}: ConsultationCTAProps) {
  const bucket = bucketForGrade(grade);
  const heading = HEADINGS[bucket];
  const items = CHECKLISTS[bucket];
  const ctaLabel = CTA_LABELS[bucket];

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
              <CheckIcon size={12} strokeWidth={3} />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button type="button" variant="primary" onClick={() => onCTAClick?.()}>
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}

export default ConsultationCTA;
