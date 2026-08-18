import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

import './text-field.css';

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({
  className = '',
  error,
  hint,
  id,
  label,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = error || hint ? `${inputId}-description` : undefined;

  return (
    <div className={`ds-text-field ${className}`.trim()}>
      <label className="ds-text-field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        className="ds-text-field__input"
        id={inputId}
        {...props}
      />
      {error || hint ? (
        <span
          className={`ds-text-field__description ${error ? 'ds-text-field__description--error' : ''}`}
          id={descriptionId}
        >
          {error ?? hint}
        </span>
      ) : null}
    </div>
  );
}
