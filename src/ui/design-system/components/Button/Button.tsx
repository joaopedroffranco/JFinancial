import type { ButtonHTMLAttributes, ReactNode } from 'react';

import './button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  iconOnly?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export function Button({
  children,
  className = '',
  iconOnly = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`ds-button ds-button--${variant} ${iconOnly ? 'ds-button--icon-only' : ''} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
