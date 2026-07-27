import React, { createContext, useContext, useState, useEffect } from 'react';
import { PanelLeft } from 'lucide-react';

interface SidebarContextType {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  children,
}) => {
  const [openState, setOpenState] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  const open = openProp !== undefined ? openProp : openState;

  const setOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    const nextOpen = typeof value === 'function' ? value(open) : value;
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setOpenState(nextOpen);
    }
  };

  const toggleSidebar = () => {
    setOpen((prev) => !prev);
  };

  // Keyboard shortcut listener: Cmd+B / Ctrl+B
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Window resize handler for mobile responsiveness
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const state = open ? 'expanded' : 'collapsed';

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        toggleSidebar,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

/* Sidebar Main Container */
export const Sidebar: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const { open } = useSidebar();

  return (
    <aside
      data-state={open ? 'expanded' : 'collapsed'}
      className={`border-r border-[var(--border-subtle)] bg-[var(--surface-sidebar)] flex flex-col h-full shrink-0 select-none transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] ${
        open ? 'w-64' : 'w-16'
      } ${className}`}
    >
      {children}
    </aside>
  );
};

/* Sticky Top Header */
export const SidebarHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-3 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 ${className}`}>
      {children}
    </div>
  );
};

/* Scrollable Middle Content */
export const SidebarContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`flex-1 overflow-y-auto p-2 space-y-3 ${className}`}>{children}</div>;
};

/* Sticky Bottom Footer */
export const SidebarFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`p-3 border-t border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--surface-sidebar)] ${className}`}>
      {children}
    </div>
  );
};

/* Grouping Container */
export const SidebarGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`space-y-1.5 ${className}`}>{children}</div>;
};

export const SidebarGroupLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const { open } = useSidebar();
  if (!open) return null;

  return (
    <div className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 ${className}`}>
      {children}
    </div>
  );
};

export const SidebarGroupContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`space-y-0.5 ${className}`}>{children}</div>;
};

export const SidebarMenu: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <ul className={`space-y-1 ${className}`}>{children}</ul>;
};

export const SidebarMenuItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <li className={`list-none ${className}`}>{children}</li>;
};

export const SidebarMenuButton: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  title?: string;
  className?: string;
}> = ({ children, isActive, onClick, title, className = '' }) => {
  const { open } = useSidebar();

  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all duration-[var(--duration-fast)] cursor-pointer ${
        isActive
          ? 'bg-[var(--accent-soft)] text-[var(--text-primary)] font-semibold border-l-2 border-[var(--accent)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
      } ${!open ? 'justify-center px-0' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

/* Sidebar Trigger Button */
export const SidebarTrigger: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { toggleSidebar, open } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      title={open ? 'Collapse Sidebar (⌘B)' : 'Expand Sidebar (⌘B)'}
      className={`p-1.5 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all duration-[var(--duration-fast)] cursor-pointer ${className}`}
    >
      <PanelLeft className="w-4 h-4" />
    </button>
  );
};
