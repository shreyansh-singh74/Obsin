import { useState, useEffect } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { useAuthStore } from '@/store/useAuthStore';
import { executeVaultSync } from '@/engine/sync';
import { setupSessionValidation } from '@/engine/github/session';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { ReadingCanvas } from '@/components/layout/ReadingCanvas';
import { SearchModal } from '@/components/search/SearchModal';
import { OfflineBanner } from '@/components/sync/OfflineBanner';
import { GraphView } from '@/components/graph/GraphView';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

/**
 * Reads the note path from the URL hash: /app#vault-id/note/path.md
 */
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

/**
 * Writes the note path to the URL hash without triggering navigation.
 */
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

  // Validate token on mount and set up periodic checks
  useEffect(() => {
    const cleanup = setupSessionValidation();
    return cleanup;
  }, []);

  // Load vaults and navigate to hash-specified note on initial load
  useEffect(() => {
    loadVaults();
  }, [loadVaults]);

  // Once vaults are loaded, navigate to the hash-specified vault/note
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
  }, [vaults]); // Only run once when vaults first load

  // Sync URL hash when active note changes
  useEffect(() => {
    if (activeVault && activeNotePath) {
      writeHashState(activeVault.id, activeNotePath);
    }
  }, [activeVault, activeNotePath]);

  // Listen for browser back/forward on the hash
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

  // Automatically trigger sync when activeVault is loaded
  useEffect(() => {
    if (activeVault) {
      executeVaultSync(activeVault, token)
        .then(() => {
          refreshNotes();
        })
        .catch((err) => {
          console.error('Initial vault sync error:', err);
        });
    }
  }, [activeVault?.id, token]);

  // Global Keyboard Shortcuts: Cmd+K / Ctrl+K (search), Cmd+G / Ctrl+G (graph)
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
        <div className="h-screen w-screen bg-[var(--surface-page)] text-[var(--text-primary)] flex flex-col overflow-hidden font-sans transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">
          {/* Offline Status Bar */}
          <OfflineBanner />

          {/* Primary Top Header */}
          <AppHeader onOpenSearch={() => setIsSearchOpen(true)} />

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <ReadingCanvas />
          </div>

          {/* Command Palette / Search Modal */}
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

          {/* Graph View Overlay */}
          {isGraphOpen && (
            <GraphView mode="overlay" onClose={() => setIsGraphOpen(false)} />
          )}
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
