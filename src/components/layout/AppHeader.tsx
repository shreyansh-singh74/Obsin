import React, { useMemo } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ProfileMenu } from './ProfileMenu';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import { executeVaultSync } from '@/engine/sync';
import { getNotesByVault } from '@/db/repository/notesRepo';
import { ArrowLeft, ArrowRight, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
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
      // Capture notes before sync to detect changes
      const notesBefore = await getNotesByVault(activeVault.id);
      const shaMap = new Map<string, string>();
      for (const note of notesBefore) {
        shaMap.set(note.path, note.sha);
      }

      const notesAfter = await executeVaultSync(activeVault, token);

      // Find new or updated files
      const updatedFiles: string[] = [];
      for (const note of notesAfter) {
        const oldSha = shaMap.get(note.path);
        if (!oldSha || oldSha !== note.sha) {
          updatedFiles.push(note.path);
        }
      }

      if (updatedFiles.length > 0) {
        for (const filePath of updatedFiles) {
          const fileName = filePath.split('/').pop() || filePath;
          toast.success(`Updated: ${fileName}`, {
            description: filePath,
          });
        }
      } else {
        toast.info('Vault is up to date');
      }

      await refreshNotes();
    } catch (err) {
      console.error('Sync failed:', err);
      toast.error('Sync failed', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
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

      {/* Center: Breadcrumb — show last 2 segments on mobile, full on desktop */}
      <div className="flex-1 flex justify-center min-w-0 px-2 sm:px-4">
        {activeNote && (
          <nav className="hidden sm:flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] min-w-0 overflow-hidden">
            {pathParts.map((part, i) => {
              const fullPath = pathParts.slice(0, i + 1).join('/');
              const isLast = i === pathParts.length - 1;
              const isFile = isLast && !activeNote?.path.endsWith('/');
              const showOnMobile = i >= pathParts.length - 2;
              const isFirstVisible = i === pathParts.length - 2;
              // Show ellipsis before the first visible segment if there are hidden segments before it
              const showEllipsis = isFirstVisible && i > 0;
              return (
                <React.Fragment key={i}>
                  {showEllipsis && (
                    <>
                      <span className="text-[var(--text-muted)] shrink-0 hidden md:inline">...</span>
                      <span className="text-[var(--text-subtle)]/40 shrink-0 hidden md:inline">/</span>
                    </>
                  )}
                  {i > 0 && !showEllipsis && <span className={`text-[var(--text-subtle)]/40 shrink-0 ${!showOnMobile ? 'hidden md:inline' : ''}`}>/</span>}
                  <button
                    onClick={() => {
                      if (isFile) {
                        setActiveNotePath(fullPath);
                      } else {
                        expandFolderPath(fullPath);
                      }
                    }}
                    className={`shrink-0 hover:text-[var(--text-primary)] transition-colors cursor-pointer truncate max-w-[100px] md:max-w-[120px] ${
                      !showOnMobile ? 'hidden md:inline-flex' : ''
                    } ${isLast ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}`}
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
