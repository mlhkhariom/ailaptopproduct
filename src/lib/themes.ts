export const themes = {
  default: { primary: '#2563eb', secondary: '#64748b', accent: '#f59e0b', radius: '8px', font: 'Inter' },
  ocean: { primary: '#0891b2', secondary: '#475569', accent: '#06b6d4', radius: '12px', font: 'DM Sans' },
  forest: { primary: '#16a34a', secondary: '#4b5563', accent: '#84cc16', radius: '6px', font: 'Nunito' },
  royal: { primary: '#7c3aed', secondary: '#6b7280', accent: '#ec4899', radius: '10px', font: 'Poppins' },
};
export type ThemeName = keyof typeof themes;
export function applyTheme(name: ThemeName) {
  const t = themes[name] || themes.default;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', t.primary);
  root.style.setProperty('--color-secondary', t.secondary);
  root.style.setProperty('--color-accent', t.accent);
  root.style.setProperty('--radius', t.radius);
  root.style.setProperty('--font-family', t.font);
}
