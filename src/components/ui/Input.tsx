import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...rest },
  ref,
) {
  const classes = [styles.input, className ?? ''].filter(Boolean).join(' ');
  return <input ref={ref} type={type} className={classes} {...rest} />;
});

export default Input;
