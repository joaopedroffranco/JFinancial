import type { SelectHTMLAttributes } from 'react';
import { useId } from 'react';

import './select-field.css';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  error?: string;
  placeholder?: string;
}

export function SelectField({
  className = '',
  error,
  id,
  label,
  options,
  placeholder = 'Selecione',
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const descriptionId = error ? `${selectId}-description` : undefined;

  return (
    <div className={`ds-select-field ${className}`.trim()}>
      <label className="ds-select-field__label" htmlFor={selectId}>
        {label}
      </label>
      <select
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        className="ds-select-field__input"
        id={selectId}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span className="ds-select-field__description" id={descriptionId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
