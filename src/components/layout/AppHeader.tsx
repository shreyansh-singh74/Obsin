import React, { useState } from 'react';
import { VaultSelector } from './VaultSelector';
import { SyncStatusBadge } from '@/components/sync/SyncStatusBadge';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, Key, Database } from 'lucide-react';

interface AppHeaderProps {
  onOpenSearch: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenSearch }) => {
  const { token, setToken } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tempToken, setTempToken] = useState(token);

  function handleSaveToken(e: React.FormEvent) {
    e.preventDefault();
    setToken(tempToken);
    setShowAuthModal(false);
  }

  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--surface-sidebar)] px-4 flex items-center justify-between z-[var(--z-sticky)] select-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">
      {/* Left: Brand Logo & Vault Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[var(--accent-soft)] text-[var(--accent-text)] rounded-[var(--radius-md)] border border-[var(--accent-soft)]">
            <Database className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[var(--text-primary)] hidden sm:inline">PocketVault</span>
        </div>

        <VaultSelector />
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

      {/* Right: Sync Badge, Auth & Theme Controls */}
      <div className="flex items-center gap-3">
        <SyncStatusBadge />

        <button
          onClick={() => setShowAuthModal(true)}
          title={token ? 'GitHub Token Configured' : 'Configure GitHub PAT'}
          className={`p-1.5 rounded-[var(--radius-md)] border transition-all cursor-pointer ${
            token
              ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-soft)]'
              : 'bg-[var(--surface-input)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
        </button>

        <ThemeSwitcher />
      </div>

      {/* Token Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal)] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--surface-modal)] border border-[var(--border-default)] rounded-[var(--radius-lg)] max-w-md w-full p-6 shadow-[var(--shadow-lg)] space-y-4">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <Key className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-base">GitHub Personal Access Token</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              PocketVault accesses public repositories freely. For private repositories or higher GitHub API rate limits (5,000 req/hr), add a PAT with <code className="text-[var(--accent-text)]">repo</code> read access.
            </p>

            <form onSubmit={handleSaveToken} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] font-medium mb-1">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--text-on-accent)] font-medium hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
                >
                  Save Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
