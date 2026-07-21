import React, { useEffect, useState } from 'react';
import { Sun, Moon, BookOpen } from 'lucide-react';

export type Theme = 'dark' | 'light' | 'sepia';

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('pocketvault_theme') as Theme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-sepia');
    if (theme === 'light') root.classList.add('theme-light');
    if (theme === 'sepia') root.classList.add('theme-sepia');
    localStorage.setItem('pocketvault_theme', theme);
  }, [theme]);

  return (
    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
      <button
        onClick={() => setTheme('dark')}
        title="Dark Obsidian Theme"
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          theme === 'dark' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setTheme('sepia')}
        title="Sepia Reading Theme"
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          theme === 'sepia' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setTheme('light')}
        title="Light Paper Theme"
        className={`p-1.5 rounded-md transition-all cursor-pointer ${
          theme === 'light' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
