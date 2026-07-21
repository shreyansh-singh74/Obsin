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
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand Logo & Vault Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Database className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">PocketVault</span>
        </div>

        <VaultSelector />
      </div>

      {/* Center: Search Trigger Bar */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer shadow-inner max-w-sm w-full mx-4"
      >
        <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="truncate flex-1 text-left">Search notes, headings, tags...</span>
        <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded bg-slate-950">
          ⌘K
        </kbd>
      </button>

      {/* Right: Sync Badge, Auth & Theme Controls */}
      <div className="flex items-center gap-3">
        <SyncStatusBadge />

        <button
          onClick={() => setShowAuthModal(true)}
          title={token ? 'GitHub Token Configured' : 'Configure GitHub PAT'}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            token
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
        </button>

        <ThemeSwitcher />
      </div>

      {/* Token Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-slate-200">
              <Key className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-base">GitHub Personal Access Token</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              PocketVault accesses public repositories freely. For private repositories or higher GitHub API rate limits (5,000 req/hr), add a PAT with <code className="text-indigo-300">repo</code> read access.
            </p>

            <form onSubmit={handleSaveToken} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
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
