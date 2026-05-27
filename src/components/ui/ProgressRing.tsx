export type ProgressRingSize = 'sm' | 'md' | 'lg';
export type ProgressRingGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ProgressRingProps {
  score: number;
  grade: ProgressRingGrade;
  size?: ProgressRingSize;
}

const SIZE_PX: Record<ProgressRingSize, number> = {
  sm: 64,
  md: 96,
  lg: 128,
};

const STROKE_PX: Record<ProgressRingSize, number> = {
  sm: 6,
  md: 8,
  lg: 10,
};

const SCORE_FONT: Record<ProgressRingSize, string> = {
  sm: '1.125rem',
  md: '1.5rem',
  lg: '2rem',
};

const GRADE_FONT: Record<ProgressRingSize, string> = {
  sm: 'var(--font-size-xs)',
  md: 'var(--font-size-sm)',
  lg: 'var(--font-size-md)',
};

const GRADE_VAR: Record<ProgressRingGrade, string> = {
  A: 'var(--grade-a)',
  B: 'var(--grade-b)',
  C: 'var(--grade-c)',
  D: 'var(--grade-d)',
  F: 'var(--grade-f)',
};

export function ProgressRing({ score, grade, size = 'md' }: ProgressRingProps) {
  const dimension = SIZE_PX[size];
  const stroke = STROKE_PX[size];
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const strokeColor = GRADE_VAR[grade];

  return (
    <div
      role="img"
      aria-label={`Score ${clamped} of 100, grade ${grade}`}
      style={{
        position: 'relative',
        width: dimension,
        height: dimension,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        style={{ transform: 'rotate(-90deg)', display: 'block' }}
        aria-hidden
      >
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke="var(--color-border)"
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={strokeColor}
          style={{ transition: 'stroke-dashoffset 400ms ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text)',
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontSize: SCORE_FONT[size],
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
          }}
        >
          {clamped}
        </span>
        <span
          style={{
            marginTop: 'var(--space-1)',
            fontSize: GRADE_FONT[size],
            fontFamily: 'var(--font-body)',
            color: strokeColor,
            fontWeight: 600,
          }}
        >
          {grade}
        </span>
      </div>
    </div>
  );
}

export default ProgressRing;
