import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

export const ProfileMenu: React.FC = () => {
  const { user, clearToken } = useAuthStore();
  
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen]);

  if (!user) return null;

  function handleSignOut() {
    clearToken();
    navigate('/auth');
  }



  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
      >
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-7 h-7 rounded-full border border-[var(--border-subtle)]"
        />
        <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-56 bg-[var(--surface-popover)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-[var(--z-dropdown)] overflow-hidden animate-pop-in">
          {/* User info */}
          <div className="px-3 py-2.5 border-b border-[var(--border-subtle)]/50">
            <div className="flex items-center gap-2">
              <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name || user.login}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">@{user.login}</p>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="px-1 py-1 border-b border-[var(--border-subtle)]/50">
            <div className="px-2 py-1.5 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">Theme</span>
              <ThemeSwitcher />
            </div>
          </div>

          {/* Sign out */}
          <div className="px-1 py-1">
            <button
              onClick={handleSignOut}
              className="w-full px-2 py-1.5 text-left text-xs text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 rounded-[var(--radius-sm)] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}


    </div>
  );
};


