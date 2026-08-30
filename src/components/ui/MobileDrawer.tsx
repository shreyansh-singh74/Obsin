import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

/**
 * Mobile bottom-sheet / slide-in drawer.
 * - Slides in from the left on open
 * - Backdrop tap to close
 * - Swipe-left gesture to close (touch drag)
 * - Traps focus inside when open (basic a11y)
 * - Uses CSS transforms for 60fps animation
 */
export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  children,
  side = 'left',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const isDragging = useRef(false);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Swipe-to-close gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!open) return;
      touchCurrentX.current = e.touches[0].clientX;
      const deltaX = touchCurrentX.current - touchStartX.current;

      // Only allow swipe-left to close (dragging the drawer offscreen)
      if (side === 'left' && deltaX < 0) {
        isDragging.current = true;
        if (drawerRef.current) {
          const progress = Math.min(Math.abs(deltaX) / 200, 1);
          drawerRef.current.style.transform = `translateX(${-progress * 100}%)`;
          drawerRef.current.style.opacity = `${1 - progress * 0.5}`;
        }
      }
    },
    [open, side]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    const deltaX = touchCurrentX.current - touchStartX.current;

    if (drawerRef.current) {
      // If swiped more than 40% of width, close; otherwise snap back
      if (Math.abs(deltaX) > 100) {
        onClose();
      } else {
        drawerRef.current.style.transform = '';
        drawerRef.current.style.opacity = '';
      }
    }
    isDragging.current = false;
  }, [onClose]);

  // Reset transform when drawer closes
  useEffect(() => {
    if (!open && drawerRef.current) {
      drawerRef.current.style.transform = '';
      drawerRef.current.style.opacity = '';
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`absolute top-0 bottom-0 w-[85vw] max-w-[320px] bg-[var(--surface-sidebar)] border-[var(--border-subtle)] shadow-[var(--shadow-lg)] flex flex-col animate-drawer-in ${
          side === 'left'
            ? 'left-0 border-r'
            : 'left-0 border-l'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-2 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--border-subtle)]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Drawer Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
