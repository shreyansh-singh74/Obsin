import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'dark' | 'light';

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('obsin_theme') as Theme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('obsin_theme', theme);
  }, [theme]);

  return (
    <div className="flex items-center bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-1 gap-0.5 shadow-inner">
      <button
        onClick={() => setTheme('dark')}
        title="Dark Obsidian Theme"
        className={`p-1.5 rounded-[var(--radius-sm)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] cursor-pointer ${
          theme === 'dark'
            ? 'bg-[var(--accent)] text-[var(--text-on-accent)] shadow-[var(--shadow-sm)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setTheme('light')}
        title="Light Paper Theme"
        className={`p-1.5 rounded-[var(--radius-sm)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] cursor-pointer ${
          theme === 'light'
            ? 'bg-[var(--accent)] text-[var(--text-on-accent)] shadow-[var(--shadow-sm)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
