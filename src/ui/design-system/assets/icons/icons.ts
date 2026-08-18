export const iconPaths = {
  add: ['M12 5v14', 'M5 12h14'],
  calendar: ['M6 2v4', 'M18 2v4', 'M3 9h18', 'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z'],
  delete: [
    'M3 6h18',
    'M8 6V4h8v2',
    'M19 6l-1 14H6L5 6',
    'M10 11v5',
    'M14 11v5',
  ],
  edit: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z'],
  home: ['M3 11 12 3l9 8', 'M5 10v10h14V10', 'M9 20v-6h6v6'],
  wallet: ['M4 5h14a2 2 0 0 1 2 2v12H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', 'M2 9h18', 'M16 14h.01'],
} as const;

export type IconName = keyof typeof iconPaths;
