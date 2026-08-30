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
    <div className="flex items-center bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-0.5 gap-0.5">
      <button
        onClick={() => setTheme('dark')}
        title="Dark Theme"
        className={`relative p-2 md:p-1.5 rounded-[var(--radius-sm)] transition-all duration-300 ease-[var(--ease-standard)] cursor-pointer min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center ${
          theme === 'dark'
            ? 'bg-[var(--accent)] text-[var(--text-on-accent)] shadow-[0_1px_4px_rgba(124,58,237,0.3)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
        }`}
      >
        <Moon className={`w-4 h-4 md:w-3.5 md:h-3.5 transition-transform duration-300 ${theme === 'dark' ? 'scale-100' : 'scale-90'}`} />
      </button>

      <button
        onClick={() => setTheme('light')}
        title="Light Theme"
        className={`relative p-2 md:p-1.5 rounded-[var(--radius-sm)] transition-all duration-300 ease-[var(--ease-standard)] cursor-pointer min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center ${
          theme === 'light'
            ? 'bg-[var(--accent)] text-[var(--text-on-accent)] shadow-[0_1px_4px_rgba(124,58,237,0.3)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
        }`}
      >
        <Sun className={`w-4 h-4 md:w-3.5 md:h-3.5 transition-transform duration-300 ${theme === 'light' ? 'scale-100' : 'scale-90'}`} />
      </button>
    </div>
  );
};
