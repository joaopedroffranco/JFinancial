import {
  iconPaths,
  type IconName,
} from '../../assets/icons/icons';
import './icon.css';

export type { IconName } from '../../assets/icons/icons';

export interface IconProps {
  name: IconName;
  size?: 'sm' | 'md';
}

export function Icon({ name, size = 'md' }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={`ds-icon ds-icon--${size}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      {iconPaths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
