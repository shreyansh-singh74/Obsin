import React, { useState } from 'react';
import type { TreeNode } from '@/utils/tree';
import { useVaultStore } from '@/store/useVaultStore';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react';

interface FileTreeNodeProps {
  node: TreeNode;
  depth?: number;
  /** Called when a note file is selected */
  onNoteSelected?: () => void;
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, depth = 0, onNoteSelected }) => {
  const { activeNotePath, setActiveNotePath } = useVaultStore();
  const [isOpen, setIsOpen] = useState(false);

  const paddingLeft = `${depth * 12 + 12}px`;
  const isSelected = !node.isFolder && activeNotePath === node.path;

  function handleNoteClick() {
    setActiveNotePath(node.path);
    onNoteSelected?.();
  }

  if (node.isFolder) {
    return (
      <div className="select-none">
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft }}
          className="w-full text-left py-2 md:py-1.5 pr-3 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-[var(--radius-sm)] flex items-center justify-between transition-colors duration-[var(--duration-fast)] cursor-pointer group min-h-[44px] md:min-h-0"
        >
          <div className="flex items-center gap-1.5 truncate">
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--icon-muted)] group-hover:text-[var(--text-primary)] shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--icon-muted)] group-hover:text-[var(--text-primary)] shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-[var(--icon-muted)] group-hover:text-[var(--text-secondary)] shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>

          {node.noteCount !== undefined && node.noteCount > 0 && (
            <span className="text-[10px] font-mono text-[var(--text-subtle)] px-1.5 py-0.2 rounded-[var(--radius-xs)] bg-[var(--surface-input)]">
              {node.noteCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <FileTreeNode key={child.path} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleNoteClick}
      style={{ paddingLeft }}
      className={`w-full text-left py-2 md:py-1.5 pr-3 text-xs font-medium rounded-[var(--radius-sm)] flex items-center gap-2 transition-all duration-[var(--duration-fast)] cursor-pointer truncate min-h-[44px] md:min-h-0 ${
        isSelected
          ? 'bg-[var(--accent-soft)] text-[var(--text-primary)] font-semibold border-l-2 border-[var(--accent)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
      }`}
    >
      <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[var(--accent-text)]' : 'text-[var(--icon-muted)]'}`} />
      <span className="truncate">{node.name}</span>
    </button>
  );
};
