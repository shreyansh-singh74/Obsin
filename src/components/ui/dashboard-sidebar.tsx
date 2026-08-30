import React, { useState, useMemo } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { buildTreeOnce, type TreeNode } from '@/utils/tree';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
} from 'lucide-react';

type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

function WorkspaceSwitcher({ selected, onSelect, vaults }: { selected?: string; onSelect?: (ws: string) => void; vaults: { id: string; name: string; owner: string; repo: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState(selected || vaults[0]?.name || 'No Vault');
  const current = selected || internalSelected;
  const handleSelect = onSelect || setInternalSelected;

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-2 mb-2 rounded-lg hover:bg-[var(--surface-hover)] cursor-pointer transition-colors select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-[var(--accent)] text-[var(--text-on-accent)] flex items-center justify-center font-semibold text-[13px] shadow-sm">
            {current.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-medium leading-none mb-1 text-[var(--text-primary)] truncate max-w-[120px]">{current}</span>
            <span className="text-[11px] text-[var(--text-muted)] leading-none">{vaults.length} vault{vaults.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" strokeWidth={1.5} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[52px] left-0 w-full bg-[var(--surface-popover)] border border-[var(--border-default)] rounded-lg shadow-xl z-50 py-1 flex flex-col gap-0.5 animate-pop-in">
            {vaults.map((v) => (
              <div
                key={v.id}
                onClick={() => { handleSelect(v.name); setIsOpen(false); }}
                className={`px-3 py-2 mx-1 text-[13px] rounded-md cursor-pointer transition-colors ${current === v.name ? 'bg-[var(--accent-soft)] text-[var(--accent-text)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}
              >
                <span className="block truncate">{v.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{v.owner}/{v.repo}</span>
              </div>
            ))}

          </div>
        </>
      )}
    </div>
  );
}

function NavItem({
  item,
  activeId,
  onSelect,
  level = 0,
  defaultOpen = false,
  expandedFolderPaths,
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (id: string) => void;
  level?: number;
  defaultOpen?: boolean;
  expandedFolderPaths?: Set<string>;
}) {
  const isActive = activeId === item.id;
  const hasChildren = !!item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  React.useEffect(() => {
    if (defaultOpen && !isOpen) setIsOpen(true);
  }, [defaultOpen]);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.id);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={`group flex items-center justify-between px-2.5 py-[6px] rounded-[6px] cursor-pointer transition-all duration-200 select-none
          ${isActive
            ? 'bg-[var(--accent-soft)] text-[var(--text-primary)] font-medium'
            : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <item.icon
            className={`w-[16px] h-[16px] shrink-0 transition-colors
              ${isActive ? 'text-[var(--accent-text)]' : 'text-[var(--icon-muted)] group-hover:text-[var(--text-muted)]'}
            `}
            strokeWidth={1.5}
          />
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.shortcut && (
            <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-[var(--text-muted)] bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[4px]">
              {item.shortcut}
            </kbd>
          )}
          {item.badge && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)]">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div
              className="absolute top-0 bottom-0 border-l border-[var(--border-subtle)]"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                activeId={activeId}
                onSelect={onSelect}
                level={level + 1}
                defaultOpen={expandedFolderPaths?.has(child.id) || false}
                expandedFolderPaths={expandedFolderPaths}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Convert a TreeNode to NavItemData */
function treeNodeToNavItem(node: TreeNode): NavItemData {
  if (node.isFolder) {
    return {
      id: node.path,
      title: node.name,
      icon: node.children.length > 0 ? Folder : Folder,
      children: node.children.map(treeNodeToNavItem),
    };
  }
  return {
    id: node.path,
    title: node.name,
    icon: FileText,
  };
}

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className = '' }: DashboardSidebarProps) {
  const { notes, activeVault, activeNotePath, setActiveNotePath, vaults, setActiveVault, expandedFolderPaths } = useVaultStore();
  const [searchQuery, setSearchQuery] = useState('');

  const treeNodes = useMemo(() => {
    if (!notes || notes.length === 0) return [];
    return buildTreeOnce(notes);
  }, [notes]);

  // Convert tree to nav items with search filter
  const navItems = useMemo(() => {
    let nodes = treeNodes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const filterTree = (items: TreeNode[]): TreeNode[] => {
        return items.filter((n) => {
          if (n.name.toLowerCase().includes(q)) return true;
          if (n.isFolder) {
            const filteredChildren = filterTree(n.children);
            return filteredChildren.length > 0;
          }
          return false;
        }).map((n) => ({
          ...n,
          children: n.isFolder ? filterTree(n.children) : [],
        }));
      };
      nodes = filterTree(treeNodes);
    }
    return nodes.map(treeNodeToNavItem);
  }, [treeNodes, searchQuery]);

  const handleSelect = (id: string) => {
    setActiveNotePath(id);
  };

  if (!activeVault) return null;

  return (
    <div className={`flex flex-col h-full bg-[var(--surface-sidebar)] border-r border-[var(--border-default)] font-sans ${className}`}>
      {/* Workspace Switcher */}
      <div className="px-4 pt-3 pb-1">
        <WorkspaceSwitcher
          selected={activeVault.name}
          vaults={vaults}
          onSelect={(name) => {
            const v = vaults.find((vault) => vault.name === name);
            if (v) setActiveVault(v);
          }}
        />
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--icon-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[var(--radius-md)] pl-8 pr-3 py-1.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] placeholder:text-[var(--text-muted)] transition-colors"
          />
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 py-1 flex flex-col gap-1 ">
        {navItems.length > 0 ? (
          navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              activeId={activeNotePath || ''}
              onSelect={handleSelect}
              defaultOpen={expandedFolderPaths.has(item.id)}
              expandedFolderPaths={expandedFolderPaths}
            />
          ))
        ) : (
          <div className="p-4 text-center text-[13px] text-[var(--text-muted)]">
            {searchQuery ? 'No matches found.' : 'No files in vault.'}
          </div>
        )}
      </div>

      {/* Footer — note count */}
      <div className="px-4 py-2 border-t border-[var(--border-default)] text-[11px] text-[var(--text-muted)]">
        {notes.length} note{notes.length !== 1 ? 's' : ''} · {activeVault.name}
      </div>
    </div>
  );
}

export default DashboardSidebar;
