import type { HTMLAttributes } from 'react';

import './heading.css';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'display' | 'large' | 'medium' | 'small';
}

export function Heading({
  as: Component = 'h2',
  className = '',
  size = 'medium',
  ...props
}: HeadingProps) {
  return (
    <Component
      className={`ds-heading ds-heading--${size} ${className}`.trim()}
      {...props}
    />
  );
}
