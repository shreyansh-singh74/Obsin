import React, { useMemo, useState } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { buildTreeOnce } from '@/utils/tree';
import { FileTreeNode } from './FileTreeNode';
import { useSidebar } from '@/components/ui/sidebar';
import { FolderTree as FolderTreeIcon, Search, FileText } from 'lucide-react';

interface FolderTreeProps {
  /** Called when a note file is selected (useful for auto-closing mobile drawer) */
  onNoteSelected?: () => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ onNoteSelected }) => {
  const { notes, activeVault } = useVaultStore();
  const { open } = useSidebar();
  const [filterText, setFilterText] = useState('');

  const treeNodes = useMemo(() => {
    if (!notes || notes.length === 0) return [];
    if (!filterText.trim()) {
      return buildTreeOnce(notes);
    }
    const filterLower = filterText.toLowerCase();
    const filteredNotes = notes.filter(
      (n) => n.name.toLowerCase().includes(filterLower) || n.path.toLowerCase().includes(filterLower)
    );
    return buildTreeOnce(filteredNotes);
  }, [notes, filterText]);

  if (!activeVault) {
    return (
      <div className="p-2 text-xs text-[var(--text-muted)] font-mono text-center truncate">
        {open ? 'No active vault selected.' : 'No vault'}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Sidebar Section Header */}
      {open && (
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 truncate">
            <FolderTreeIcon className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" /> Vault Notes ({notes.length})
          </span>
        </div>
      )}

      {/* Quick Tree Filter */}
      {open && (
        <div className="px-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--icon-muted)] absolute left-2.5 top-2.5" />              <input
                type="text"
                placeholder="Filter files..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] pl-8 pr-3 py-2.5 md:py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--focus-ring)] font-sans min-h-[44px] md:min-h-0"
              />
          </div>
        </div>
      )}

      {/* Tree View Container */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {treeNodes.length > 0 ? (
          treeNodes.map((node) => <FileTreeNode key={node.path} node={node} onNoteSelected={onNoteSelected} />)
        ) : (
          <div className="p-4 text-center text-xs text-[var(--text-muted)] space-y-2">
            <FileText className="w-6 h-6 stroke-1 text-[var(--icon-muted)] mx-auto" />
            {open && <p>No notes in this vault tree.</p>}
          </div>
        )}
      </div>
    </div>
  );
};
