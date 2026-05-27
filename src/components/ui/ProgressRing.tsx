import type { CSSProperties, ReactNode } from 'react';
import styles from './ProgressRing.module.css';

type Size = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<Size, number> = {
  sm: 88,
  md: 128,
  lg: 192,
};

const STROKE_PX: Record<Size, number> = {
  sm: 8,
  md: 10,
  lg: 14,
};

const VALUE_FONT: Record<Size, string> = {
  sm: '1.5rem',
  md: '2rem',
  lg: '3rem',
};

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: Size;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
  showValue?: boolean;
  suffix?: string;
  ariaLabel?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 'md',
  color,
  trackColor,
  children,
  showValue = true,
  suffix = '/100',
  ariaLabel,
}: ProgressRingProps) {
  const dimension = SIZE_PX[size];
  const stroke = STROKE_PX[size];
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(max, value));
  const ratio = max > 0 ? clamped / max : 0;
  const offset = circumference - ratio * circumference;

  const barStyle: CSSProperties = color ? { stroke: color } : {};
  const trackStyle: CSSProperties = trackColor ? { stroke: trackColor } : {};

  return (
    <div
      className={styles.wrap}
      style={{ width: dimension, height: dimension }}
      role="img"
      aria-label={ariaLabel ?? `Score ${clamped} of ${max}`}
    >
      <svg
        className={styles.svg}
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        aria-hidden
      >
        <circle
          className={styles.track}
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          style={trackStyle}
        />
        <circle
          className={styles.bar}
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={barStyle}
        />
      </svg>
      <div className={styles.label}>
        {children ?? (
          showValue && (
            <>
              <span className={styles.value} style={{ fontSize: VALUE_FONT[size] }}>
                {clamped}
              </span>
              {suffix && <span className={styles.suffix}>{suffix}</span>}
            </>
          )
        )}
      </div>
    </div>
  );
}

export default ProgressRing;
