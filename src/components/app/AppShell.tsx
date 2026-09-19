import { useState, useEffect } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import { executeVaultSync } from '@/engine/sync';
import { setupSessionValidation } from '@/engine/github/session';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSyncStore } from '@/store/useSyncStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { ReadingCanvas } from '@/components/layout/ReadingCanvas';
import { SearchModal } from '@/components/search/SearchModal';
import { OfflineBanner } from '@/components/sync/OfflineBanner';
import { GraphView } from '@/components/graph/GraphView';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';


function readHashState(): { vaultId?: string; notePath?: string } {
  const hash = window.location.hash.slice(1); // Remove #
  if (!hash) return {};
  const parts = hash.split('/');
  if (parts.length >= 2) {
    const vaultId = parts[0];
    const notePath = parts.slice(1).join('/');
    return { vaultId, notePath };
  }
  return {};
}

function writeHashState(vaultId: string, notePath: string) {
  const hash = `${vaultId}/${notePath}`;
  if (window.location.hash.slice(1) !== hash) {
    window.history.replaceState(null, '', `#${hash}`);
  }
}


export function AppShell() {
  const { activeVault, activeNotePath, loadVaults, refreshNotes, setActiveVault, setActiveNotePath, vaults } = useVaultStore();
  const token = useAuthStore((state) => state.token);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  const isOnline = useOnlineStatus();


  useEffect(() => {
    if (!isOnline) return () => {};
    const cleanup = setupSessionValidation();
    return cleanup;
  }, [isOnline]);


  useEffect(() => {
    loadVaults();
  }, [loadVaults]);


  useEffect(() => {
    if (vaults.length === 0) return;
    const { vaultId, notePath } = readHashState();
    if (vaultId) {
      const vault = vaults.find((v) => v.id === vaultId);
      if (vault) {
        setActiveVault(vault).then(() => {
          if (notePath) {
            setActiveNotePath(decodeURIComponent(notePath));
          }
        });
        return;
      }
    }
  }, [vaults]);


  useEffect(() => {
    if (activeVault && activeNotePath) {
      writeHashState(activeVault.id, activeNotePath);
    }
  }, [activeVault, activeNotePath]);


  useEffect(() => {
    function handleHashChange() {
      const { vaultId, notePath } = readHashState();
      if (vaultId && notePath && activeVault) {
        if (vaultId === activeVault.id) {
          setActiveNotePath(decodeURIComponent(notePath));
        }
      }
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeVault, setActiveNotePath]);


  useEffect(() => {
    useAuthStore.getState().hydrateUser();
  }, []);


  useEffect(() => {
    if (!activeVault || !isOnline) return;
    executeVaultSync(activeVault, token)
      .then(() => {
        refreshNotes();
      })
      .catch((err) => {
        // Surface sync failures in the UI (SyncStatusBadge) instead of
        // swallowing them — offline starts land here too if racing online.
        console.error('Vault sync error:', err);
        useSyncStore.getState().setSyncError(err?.message || 'Sync failed.');
      });
  }, [activeVault?.id, token, isOnline]);


  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        setIsGraphOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsGraphOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <SidebarProvider>
        {/* Viewport lock: owns exactly 100vh/100vw with no zoom, so the
            zoomed app below can never push the page into body scroll
            (which carried the navbar away on long notes). */}
        <div className="h-screen w-full overflow-hidden bg-[var(--surface-page)]">
        {/* Zoomed app (desktop only): layout size divided by the zoom factor
            renders back to exactly the viewport size (100/1.12). On mobile
            the zoom is off — it shrinks the usable viewport and pushes
            content off-screen. */}
        <div className="h-full w-full md:h-[calc(100vh/1.12)] md:w-[calc(100vw/1.12)] bg-[var(--surface-page)] text-[var(--text-primary)] flex flex-col overflow-hidden font-sans transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] md:[zoom:1.12]">

          <OfflineBanner />

          <AppHeader onOpenSearch={() => setIsSearchOpen(true)} onOpenGraph={() => setIsGraphOpen(true)} />

          {/* Main Content Area */}
          <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
            <Sidebar onOpenGraph={() => setIsGraphOpen(true)} />
            <ReadingCanvas />
          </div>

          {/* Command Palette / Search Modal */}
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

          {/* Graph View Overlay */}
          {isGraphOpen && (
            <GraphView mode="overlay" onClose={() => setIsGraphOpen(false)} />
          )}
        </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </ErrorBoundary>
  );
}
