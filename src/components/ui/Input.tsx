import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, type = 'text', 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDescribedBy, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const describedBy = [ariaDescribedBy, errorId, hintId].filter(Boolean).join(' ') || undefined;

  const classes = ['input', className ?? ''].filter(Boolean).join(' ');

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={classes}
        aria-invalid={ariaInvalid ?? (error ? true : undefined)}
        aria-describedby={describedBy}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="form-error">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
