import React, { useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { MobileDrawer } from '@/components/ui/MobileDrawer';
import { DashboardSidebar } from '@/components/ui/dashboard-sidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { Key } from 'lucide-react';

/**
 * Sidebar wrapper that renders as a slide-in drawer on mobile
 * and a persistent sidebar on desktop (≥768px).
 */
export const Sidebar: React.FC = () => {
  const { open, setOpen, isMobile } = useSidebar();
  const { token, setToken } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tempToken, setTempToken] = useState(token);

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
          <div className="h-full">
            <DashboardSidebar />
          </div>
        </MobileDrawer>

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
      <div
        data-state={open ? 'expanded' : 'collapsed'}
        className={`bg-[var(--surface-sidebar)] flex flex-col h-full shrink-0 select-none transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] overflow-hidden ${
          open ? 'w-60 border-r border-[var(--border-default)]' : 'w-0 border-none'
        }`}
      >
        {open && <DashboardSidebar />}
      </div>

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
