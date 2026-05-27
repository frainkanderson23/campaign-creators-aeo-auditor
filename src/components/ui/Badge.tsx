import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'grade-a'
  | 'grade-b'
  | 'grade-c'
  | 'grade-d'
  | 'grade-f';

export type BadgeSize = 'sm' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: 'badge-default',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  'grade-a': 'badge-grade-a',
  'grade-b': 'badge-grade-b',
  'grade-c': 'badge-grade-c',
  'grade-d': 'badge-grade-d',
  'grade-f': 'badge-grade-f',
};

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'badge-sm',
  lg: 'badge-lg',
};

export function Badge({
  variant,
  size = 'sm',
  className,
  children,
  ...rest
}: BadgeProps) {
  const classes = [
    'badge',
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
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
