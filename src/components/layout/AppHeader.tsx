import React, { useMemo } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ProfileMenu } from './ProfileMenu';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import { executeVaultSync } from '@/engine/sync';
import { ArrowLeft, ArrowRight, RefreshCw, Search } from 'lucide-react';
import logoMark from '@/assets/logo.svg';

interface AppHeaderProps {
  onOpenSearch?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenSearch }) => {
  const {
    activeNotePath, activeVault, notes, refreshNotes,
    navigateBack, navigateForward, canGoBack, canGoForward, expandFolderPath, setActiveNotePath,
  } = useVaultStore();
  const token = useAuthStore((s) => s.token);
  const [isSyncing, setIsSyncing] = React.useState(false);

  async function handleSync() {
    if (!activeVault || isSyncing) return;
    setIsSyncing(true);
    try {
      await executeVaultSync(activeVault, token);
      await refreshNotes();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }

  const activeNote = useMemo(() => {
    if (!notes || !activeNotePath) return null;
    return notes.find((n) => n.path === activeNotePath) || null;
  }, [notes, activeNotePath]);

  const pathParts = activeNote ? activeNote.path.split('/') : [];

  return (
    <header className="h-11 border-b border-[var(--border-subtle)] bg-[var(--surface-sidebar)] px-3 flex items-center z-[var(--z-sticky)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">
      {/* Left: Sidebar Toggle, Logo, Back/Forward */}
      <div className="flex items-center gap-1.5 shrink-0">
        <SidebarTrigger />
        <a href="/" className="flex items-center shrink-0">
          <img src={logoMark} alt="Obsin" className="h-9 w-9 shrink-0" />
        </a>
        {activeNote && (
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={navigateBack}
              disabled={!canGoBack()}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
            <button
              onClick={navigateForward}
              disabled={!canGoForward()}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Go forward"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
          </div>
        )}
      </div>

      {/* Center: Breadcrumb — centered */}
      <div className="flex-1 flex justify-center min-w-0 px-4">
        {activeNote && (
          <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] min-w-0 overflow-hidden">
            {pathParts.map((part, i) => {
              const fullPath = pathParts.slice(0, i + 1).join('/');
              const isLast = i === pathParts.length - 1;
              const isFile = isLast && !activeNote?.path.endsWith('/');
              return (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-[var(--text-subtle)]/40 shrink-0">/</span>}
                  <button
                    onClick={() => {
                      if (isFile) {
                        setActiveNotePath(fullPath);
                      } else {
                        expandFolderPath(fullPath);
                      }
                    }}
                    className={`shrink-0 hover:text-[var(--text-primary)] transition-colors cursor-pointer truncate max-w-[120px] ${
                      isLast ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'
                    }`}
                    title={fullPath}
                  >
                    {i === 0 ? activeVault?.name : part}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        )}
      </div>

      {/* Right: Sync + Search + Profile */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleSync}
          disabled={isSyncing || !activeVault}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-40"
          title="Sync vault"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={onOpenSearch}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          title="Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
        
        <ProfileMenu />
      </div>
    </header>
  );
};
