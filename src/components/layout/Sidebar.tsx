import React, { useState, useCallback } from 'react';
import {
  Sidebar as SidebarContainer,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { MobileDrawer } from '@/components/ui/MobileDrawer';
import { VaultSelector } from './VaultSelector';
import { FolderTree } from '@/components/tree/FolderTree';
import { useAuthStore } from '@/store/useAuthStore';
import { Key, ShieldCheck } from 'lucide-react';

/**
 * Sidebar wrapper that renders as a slide-in drawer on mobile
 * and a persistent sidebar on desktop (≥768px).
 */
export const Sidebar: React.FC = () => {
  const { open, setOpen, isMobile } = useSidebar();
  const { token, setToken } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tempToken, setTempToken] = useState(token);

  // Auto-close drawer on mobile when a note is selected
  const handleNoteSelected = useCallback(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  function handleSaveToken(e: React.FormEvent) {
    e.preventDefault();
    setToken(tempToken);
    setShowAuthModal(false);
  }

  // --- Mobile: Slide-in Drawer ---
  if (isMobile) {
    return (
      <>
        <MobileDrawer open={open} onClose={() => setOpen(false)}>
          <SidebarContent className="p-0">
            <div className="p-3 border-b border-[var(--border-subtle)]">
              <VaultSelector />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <FolderTree onNoteSelected={handleNoteSelected} />
            </div>
            <SidebarFooter>
              <button
                onClick={() => setShowAuthModal(true)}
                title={token ? 'GitHub Token (5,000 req/hr)' : 'Configure GitHub PAT'}
                className="w-full flex items-center gap-2 p-3 rounded-[var(--radius-md)] border transition-all duration-[var(--duration-fast)] cursor-pointer text-sm min-h-[44px] bg-[var(--accent-soft)] text-[var(--accent-text)] border-[var(--accent-soft)]"
              >
                <div className="flex items-center gap-2 truncate">
                  {token ? (
                    <ShieldCheck className="w-4.5 h-4.5 text-[var(--accent-text)] shrink-0" />
                  ) : (
                    <Key className="w-4.5 h-4.5 text-[var(--icon-muted)] shrink-0" />
                  )}
                  <span className="truncate font-medium">
                    {token ? 'GitHub Token Set' : 'Configure PAT'}
                  </span>
                </div>
              </button>
            </SidebarFooter>
          </SidebarContent>
        </MobileDrawer>

        {/* Auth Modal (shared between mobile & desktop) */}
        {showAuthModal && (
          <AuthModal
            token={tempToken}
            setToken={setTempToken}
            onSave={handleSaveToken}
            onClose={() => setShowAuthModal(false)}
            hasToken={!!token}
          />
        )}
      </>
    );
  }

  // --- Desktop: Persistent Sidebar ---
  return (
    <>
      <SidebarContainer>
        <SidebarHeader>
          <VaultSelector />
        </SidebarHeader>

        <SidebarContent>
          <FolderTree />
        </SidebarContent>

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

      {showAuthModal && (
        <AuthModal
          token={tempToken}
          setToken={setTempToken}
          onSave={handleSaveToken}
          onClose={() => setShowAuthModal(false)}
          hasToken={!!token}
        />
      )}
    </>
  );
};

/* Shared Auth Modal */
const AuthModal: React.FC<{
  token: string;
  setToken: (t: string) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
  hasToken: boolean;
}> = ({ token, setToken, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal)] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[var(--surface-modal)] border border-[var(--border-default)] rounded-[var(--radius-lg)] max-w-md w-full p-6 shadow-[var(--shadow-lg)] space-y-4">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <Key className="w-5 h-5 text-[var(--accent-text)]" />
          <h3 className="font-semibold text-base">GitHub Personal Access Token</h3>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Obsin accesses public repositories freely. For private repositories or higher GitHub API rate limits (5,000 req/hr), add a PAT with <code className="text-[var(--accent-text)] font-mono">repo</code> read access.
        </p>

        <form onSubmit={onSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-[var(--text-muted)] font-medium mb-1">Personal Access Token (PAT)</label>
            <input
              type="password"
              placeholder="ghp_..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] font-mono text-xs min-h-[44px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--text-on-accent)] font-medium hover:bg-[var(--accent-hover)] transition-colors cursor-pointer min-h-[44px]"
            >
              Save Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
