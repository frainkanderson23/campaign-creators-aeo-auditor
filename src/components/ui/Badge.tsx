import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type GradeVariant = 'grade-a' | 'grade-b' | 'grade-c' | 'grade-d' | 'grade-f';
type SemanticVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted';
type BadgeVariant = GradeVariant | SemanticVariant;
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...rest
}: BadgeProps) {
  const variantClass =
    styles[`variant-${variant}`] ?? styles['variant-default'];

  const classes = [
    styles.badge,
    variantClass,
    size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}

export default Badge;
