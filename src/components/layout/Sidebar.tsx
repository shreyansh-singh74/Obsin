import React, { useState } from 'react';
import {
  Sidebar as SidebarContainer,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { VaultSelector } from './VaultSelector';
import { FolderTree } from '@/components/tree/FolderTree';
import { useAuthStore } from '@/store/useAuthStore';
import { Key, ShieldCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { open } = useSidebar();
  const { token, setToken } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tempToken, setTempToken] = useState(token);

  function handleSaveToken(e: React.FormEvent) {
    e.preventDefault();
    setToken(tempToken);
    setShowAuthModal(false);
  }

  return (
    <>
      <SidebarContainer>
        {/* Top Sticky Header: Vault Selector */}
        <SidebarHeader>
          <VaultSelector />
        </SidebarHeader>

        {/* Scrollable Middle Content: Folder Tree */}
        <SidebarContent>
          <FolderTree />
        </SidebarContent>

        {/* Bottom Sticky Footer: GitHub Auth PAT Status */}
        <SidebarFooter>
          <button
            onClick={() => setShowAuthModal(true)}
            title={token ? 'GitHub Token (5,000 req/hr)' : 'Configure GitHub PAT'}
            className={`w-full flex items-center gap-2 p-2 rounded-[var(--radius-md)] border transition-all duration-[var(--duration-fast)] cursor-pointer text-xs ${
              token
                ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-soft)]'
                : 'bg-[var(--surface-input)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            } ${!open ? 'justify-center p-2' : 'justify-between'}`}
          >
            <div className="flex items-center gap-2 truncate">
              {token ? (
                <ShieldCheck className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
              ) : (
                <Key className="w-4 h-4 text-[var(--icon-muted)] shrink-0" />
              )}
              {open && (
                <span className="truncate font-medium">
                  {token ? 'GitHub Token Set' : 'Configure PAT'}
                </span>
              )}
            </div>
            {open && (
              <span className="text-[10px] font-mono text-[var(--text-subtle)] px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-card)]">
                {token ? '5K/hr' : '60/hr'}
              </span>
            )}
          </button>
        </SidebarFooter>
      </SidebarContainer>

      {/* Token Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal)] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--surface-modal)] border border-[var(--border-default)] rounded-[var(--radius-lg)] max-w-md w-full p-6 shadow-[var(--shadow-lg)] space-y-4">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <Key className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-base">GitHub Personal Access Token</h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              PocketVault accesses public repositories freely. For private repositories or higher GitHub API rate limits (5,000 req/hr), add a PAT with <code className="text-[var(--accent-text)] font-mono">repo</code> read access.
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
    </>
  );
};
