import React, { useMemo, useState } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { buildTreeOnce } from '@/utils/tree';
import { FileTreeNode } from './FileTreeNode';
import { FolderTree as FolderTreeIcon, Search, FileText } from 'lucide-react';

export const FolderTree: React.FC = () => {
  const { notes, activeVault } = useVaultStore();
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
      <div className="p-4 text-xs text-slate-500 font-mono text-center">
        No active vault selected.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FolderTreeIcon className="w-3.5 h-3.5 text-indigo-400" /> Vault Notes ({notes.length})
        </span>
      </div>

      {/* Quick Tree Filter */}
      <div className="px-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter files..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
          />
        </div>
      </div>

      {/* Tree View Container */}
      <div className="flex-1 overflow-y-auto px-1 space-y-0.5">
        {treeNodes.length > 0 ? (
          treeNodes.map((node) => <FileTreeNode key={node.path} node={node} />)
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 space-y-2">
            <FileText className="w-8 h-8 stroke-1 text-slate-600 mx-auto" />
            <p>No notes in this vault tree.</p>
          </div>
        )}
      </div>
    </div>
  );
};
