import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { MobileDrawer } from '@/components/ui/MobileDrawer';
import { DashboardSidebar } from '@/components/ui/dashboard-sidebar';

/**
 * Sidebar wrapper that renders as a slide-in drawer on mobile
 * and a persistent sidebar on desktop (≥768px).
 *
 * Token/profile management lives in the AuthPage (/auth) — the sidebar
 * no longer hosts its own duplicate auth modal.
 */
export const Sidebar: React.FC = () => {
  const { open, isMobile } = useSidebar();

  // --- Mobile: Slide-in Drawer ---
  if (isMobile) {
    return (
      <MobileDrawer open={open} onClose={() => {}}>
        <div className="h-full">
          <DashboardSidebar />
        </div>
      </MobileDrawer>
    );
  }

  // --- Desktop: Persistent Sidebar ---
  return (
    <div
      data-state={open ? 'expanded' : 'collapsed'}
      className={`bg-[var(--surface-sidebar)] flex flex-col h-full shrink-0 select-none transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] overflow-hidden ${
        open ? 'w-60 border-r border-[var(--border-default)]' : 'w-0 border-none'
      }`}
    >
      {open && <DashboardSidebar />}
    </div>
  );
};
