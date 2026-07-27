import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SyncStatusBadge } from '@/components/sync/SyncStatusBadge';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Search, Database } from 'lucide-react';

interface AppHeaderProps {
  onOpenSearch: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenSearch }) => {
  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--surface-sidebar)] px-4 flex items-center justify-between z-[var(--z-sticky)] select-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">
      {/* Left: Sidebar Toggle Button & Brand Logo */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[var(--accent-soft)] text-[var(--accent-text)] rounded-[var(--radius-md)] border border-[var(--accent-soft)]">
            <Database className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[var(--text-primary)] hidden sm:inline">PocketVault</span>
        </div>
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

      {/* Right: Sync Badge & Theme Controls */}
      <div className="flex items-center gap-3">
        <SyncStatusBadge />
        <ThemeSwitcher />
      </div>
    </header>
  );
};
