import type { HTMLAttributes, ReactNode } from 'react';

import './card.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'article' | 'section' | 'div';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  as: Component = 'article',
  children,
  className = '',
  padding = 'md',
  ...props
}: CardProps) {
  return (
    <Component
      className={`ds-card ds-card--padding-${padding} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
