import type { HTMLAttributes } from 'react';

import './text.css';

type TextElement = 'p' | 'span' | 'small';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  variant?: 'body' | 'secondary' | 'caption' | 'eyebrow';
}

export function Text({
  as: Component = 'p',
  className = '',
  variant = 'body',
  ...props
}: TextProps) {
  return (
    <Component
      className={`ds-text ds-text--${variant} ${className}`.trim()}
      {...props}
    />
  );
}
