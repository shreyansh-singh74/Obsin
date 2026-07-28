import { useState, useEffect } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { ReadingCanvas } from '@/components/layout/ReadingCanvas';
import { SearchModal } from '@/components/search/SearchModal';
import { OfflineBanner } from '@/components/sync/OfflineBanner';


export function AppShell() {
    const { loadVaults } = useVaultStore();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        loadVaults();
    }, [loadVaults]);

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