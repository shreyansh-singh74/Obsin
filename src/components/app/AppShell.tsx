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

export function AppShell() {
  const { activeVault, loadVaults, refreshNotes } = useVaultStore();
  const token = useAuthStore((state) => state.token);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Validate token on mount and set up periodic checks
  useEffect(() => {
    const cleanup = setupSessionValidation();
    return cleanup;
  }, []);

  useEffect(() => {
    loadVaults();
  }, [loadVaults]);

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

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SidebarProvider>
      <div className="h-screen w-screen bg-[var(--surface-page)] text-[var(--text-primary)] flex flex-col overflow-hidden font-sans select-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]">
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
      </div>
    </SidebarProvider>
  );
}