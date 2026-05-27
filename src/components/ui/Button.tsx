import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'cta' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : '',
    block ? styles.block : '',
    loading ? styles.loading : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <Loader2
          className={styles.spinner}
          width={16}
          height={16}
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}

export default Button;
