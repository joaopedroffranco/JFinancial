export const iconPaths = {
  add: ['M12 5v14', 'M5 12h14'],
  delete: [
    'M3 6h18',
    'M8 6V4h8v2',
    'M19 6l-1 14H6L5 6',
    'M10 11v5',
    'M14 11v5',
  ],
  edit: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z'],
} as const;

export type IconName = keyof typeof iconPaths;
