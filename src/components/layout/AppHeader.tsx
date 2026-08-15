import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SyncStatusBadge } from '@/components/sync/SyncStatusBadge';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Search, LogOut } from 'lucide-react';
import logoMark from '@/assets/logo.svg';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  onOpenSearch: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenSearch }) => {
  const { user, clearToken } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearToken();
    navigate('/auth');
  };

  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--surface-sidebar)] px-4 flex items-center justify-between z-[var(--z-sticky)] select-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">
      {/* Left: Sidebar Toggle Button & Brand Logo */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <a href="/" className="flex items-center gap-2">
          <img src={logoMark} alt="Obsin" className="h-19 w-19 shrink-0" />
        </a>
      </div>

      {/* Center: Search Trigger Bar */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--surface-input)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-[var(--duration-fast)] cursor-pointer shadow-inner max-w-sm w-full mx-4"
      >
        <Search className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
        <span className="truncate flex-1 text-left">Search notes, headings, tags...</span>
        <kbd className="hidden sm:inline-block text-[10px] font-mono text-[var(--text-subtle)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-page)]">
          ⌘K
        </kbd>
      </button>

      {/* Right: Sync Badge, Theme Controls & User Profile */}
      <div className="flex items-center gap-3">
        <SyncStatusBadge />
        <ThemeSwitcher />

        {user && (
          <div className="flex items-center gap-2 border-l border-[var(--border-subtle)] pl-3">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-7 h-7 rounded-full border border-[var(--border-subtle)]"
            />
            <span className="text-xs font-medium text-[var(--text-primary)] hidden sm:inline-block">
              {user.login}
            </span>
            <button
              onClick={handleSignOut}
              className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
